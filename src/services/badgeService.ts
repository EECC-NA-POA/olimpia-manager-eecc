/**
 * Badge Service - Gerenciamento de badge do app
 * 
 * Usa Capacitor Badge API para atualizar o badge do ícone do app
 * com o número de notificações não lidas.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Verifica se o Badge API está disponível na plataforma atual
 */
export function isBadgeAvailable(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Atualiza o badge do app com o contador fornecido
 * 
 * @param count Número a exibir no badge (0 para limpar)
 */
export async function updateAppBadge(count: number): Promise<void> {
    if (!isBadgeAvailable()) {
        console.log('[Badge] Not available on this platform');
        return;
    }

    try {
        // Importação dinâmica para evitar erros em plataformas web
        const { Badge } = await import('@capawesome/capacitor-badge');

        if (count <= 0) {
            await Badge.clear();
            console.log('[Badge] Cleared');
        } else {
            await Badge.set({ count });
            console.log(`[Badge] Set to ${count}`);
        }
    } catch (error) {
        console.error('[Badge] Error updating badge:', error);
    }
}

/**
 * Limpa o badge do app (define como 0)
 */
export async function clearAppBadge(): Promise<void> {
    await updateAppBadge(0);
}
