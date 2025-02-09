
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
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

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
      await signIn(values.email, values.password);
    } catch (error: any) {
      console.error("Login Error:", error);
      
      // Handle specific error cases
      if (error.message?.toLowerCase().includes("invalid login credentials")) {
        toast.error("Email ou senha incorretos. Por favor, verifique suas credenciais.");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Email não confirmado. Por favor, verifique sua caixa de entrada e confirme seu email.");
      } else if (error.message?.includes("Too many requests")) {
        toast.error("Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.");
      } else if (error.message?.includes("network")) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        toast.error("Erro ao fazer login. Por favor, tente novamente.");
      }

      // Clear password field on error
      form.setValue('password', '');
    } finally {
      setIsSubmitting(false);
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
