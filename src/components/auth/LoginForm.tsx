import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('🔐 Attempting login for:', values.email);
      console.log('🔐 Login process starting...');
      
      await signIn(values.email, values.password);
      
      console.log('✅ Login successful, navigating to event selection');
      navigate('/event-selection', { replace: true });
      
    } catch (error: any) {
      console.error('❌ Login Error Details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name,
        stack: error.stack
      });
      
      // Clear password field for security
      form.setValue('password', '');
      
      // Check for invalid credentials - both English and Portuguese messages
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('Email ou senha incorretos')) {
        console.log('🔍 Invalid credentials detected');
        toast.error(
          <div className="flex flex-col gap-2">
            <p>Email ou senha incorretos</p>
            <div className="text-sm flex flex-col gap-2">
              <Link 
                to="/forgot-password"
                className="text-olimpics-green-primary hover:text-olimpics-green-secondary underline"
              >
                Esqueceu sua senha?
              </Link>
              <Link 
                to="/"
                className="text-olimpics-green-primary hover:text-olimpics-green-secondary"
              >
                Não possui uma conta? Registre-se aqui
              </Link>
            </div>
          </div>
        );
      } else if (error.message?.toLowerCase().includes("email not confirmed")) {
        console.log('📧 Email not confirmed detected');
        toast.error(
          <div className="flex flex-col gap-2">
            <p>Email não confirmado. Por favor, verifique sua caixa de entrada.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => resendVerificationEmail(values.email)}
            >
              Reenviar email de confirmação
            </Button>
          </div>
        );
      } else if (error.message?.includes("too many requests")) {
        console.log('🚫 Rate limit detected');
        toast.error("Muitas tentativas de login. Por favor, aguarde alguns minutos.");
      } else if (error.message?.includes("JWT") || error.message?.includes("connection")) {
        console.log('🌐 Connection issue detected');
        toast.error("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
      } else {
        console.log('🔥 Generic error detected:', error.message);
        toast.error("Erro ao fazer login. Por favor, tente novamente mais tarde.");
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔐 Login process finished');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-olimpics-green-primary hover:text-olimpics-green-secondary text-sm"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </form>
    </Form>
  );
};
