// supabase/functions/send-push/index.ts
// Edge Function for sending push notifications via Firebase Cloud Messaging (FCM)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PushPayload {
    user_id: string
    title: string
    body: string
    data?: Record<string, string>
    notification_id?: string
}

interface ServiceAccount {
    client_email: string
    private_key: string
    project_id: string
}

async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
    // Remove PEM headers and newlines
    const pemContents = pemKey
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '')

    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

    return await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        true,
        ['sign']
    )
}

async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
    const now = Math.floor(Date.now() / 1000)

    const privateKey = await importPrivateKey(serviceAccount.private_key)

    const jwt = await create(
        { alg: 'RS256', typ: 'JWT' },
        {
            iss: serviceAccount.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: 'https://oauth2.googleapis.com/token',
            iat: getNumericDate(0),
            exp: getNumericDate(3600),
        },
        privateKey
    )

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    })

    if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        throw new Error(`Failed to get access token: ${error}`)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token
}

async function sendFCMMessage(
    fcmToken: string,
    payload: PushPayload,
    accessToken: string,
    projectId: string
) {
    const FCM_URL = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

    const message = {
        message: {
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    default_vibrate_timings: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        },
    }

    const response = await fetch(FCM_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })

    return response
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload: PushPayload = await req.json()
        console.log('Push request for user:', payload.user_id)

        // Get Firebase service account from environment
        const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
        if (!serviceAccountJson) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
        }

        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson)

        // Initialize Supabase client with service role key
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        // Get user's active FCM tokens
        const { data: tokens, error: tokensError } = await supabase
            .from('push_tokens')
            .select('fcm_token, platform')
            .eq('user_id', payload.user_id)
            .eq('is_active', true)

        if (tokensError) throw tokensError

        if (!tokens || tokens.length === 0) {
            console.log('No active tokens for user:', payload.user_id)
            return new Response(
                JSON.stringify({ message: 'No tokens found', sent: 0 }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get FCM access token
        const accessToken = await getAccessToken(serviceAccount)

        // Send to all user devices
        let sentCount = 0
        const failedTokens: string[] = []

        for (const { fcm_token } of tokens) {
            try {
                const response = await sendFCMMessage(
                    fcm_token,
                    payload,
                    accessToken,
                    serviceAccount.project_id
                )

                if (response.ok) {
                    sentCount++
                    console.log('Push sent successfully to token:', fcm_token.substring(0, 20) + '...')
                } else {
                    const error = await response.json()
                    console.error('FCM error for token:', error)

                    // If token is invalid, mark as inactive
                    if (
                        error.error?.code === 404 ||
                        error.error?.details?.some((d: any) => d.errorCode === 'UNREGISTERED')
                    ) {
                        failedTokens.push(fcm_token)
                    }
                }
            } catch (err) {
                console.error('Error sending to token:', err)
            }
        }

        // Deactivate invalid tokens
        if (failedTokens.length > 0) {
            await supabase
                .from('push_tokens')
                .update({ is_active: false })
                .in('fcm_token', failedTokens)

            console.log('Deactivated', failedTokens.length, 'invalid tokens')
        }

        // Mark notification as sent
        if (payload.notification_id) {
            await supabase
                .from('notifications')
                .update({ push_sent: true, push_sent_at: new Date().toISOString() })
                .eq('id', payload.notification_id)
        }

        return new Response(
            JSON.stringify({
                message: 'Push sent',
                sent: sentCount,
                failed: failedTokens.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
