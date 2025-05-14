export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atletas_equipes: {
        Row: {
          atleta_id: string | null
          created_at: string | null
          equipe_id: number | null
          id: number
          posicao: number | null
          raia: number | null
          updated_at: string | null
        }
        Insert: {
          atleta_id?: string | null
          created_at?: string | null
          equipe_id?: number | null
          id?: number
          posicao?: number | null
          raia?: number | null
          updated_at?: string | null
        }
        Update: {
          atleta_id?: string | null
          created_at?: string | null
          equipe_id?: number | null
          id?: number
          posicao?: number | null
          raia?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atletas_equipes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atletas_equipes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "atletas_equipes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "atletas_equipes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "atletas_equipes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      criterios_pontuacao: {
        Row: {
          id: number
          modalidade_id: number | null
          tipo_pontuacao: string
        }
        Insert: {
          id?: number
          modalidade_id?: number | null
          tipo_pontuacao: string
        }
        Update: {
          id?: number
          modalidade_id?: number | null
          tipo_pontuacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      cronograma_atividade_modalidades: {
        Row: {
          cronograma_atividade_id: number
          modalidade_id: number
        }
        Insert: {
          cronograma_atividade_id: number
          modalidade_id: number
        }
        Update: {
          cronograma_atividade_id?: number
          modalidade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividade_modalidades_cronograma_atividade_id_fkey"
            columns: ["cronograma_atividade_id"]
            isOneToOne: false
            referencedRelation: "cronograma_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_cronograma_atividade_id_fkey"
            columns: ["cronograma_atividade_id"]
            isOneToOne: false
            referencedRelation: "vw_cronograma_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      cronograma_atividades: {
        Row: {
          atividade: string
          cronograma_id: number
          dia: string
          evento_id: string
          global: boolean
          horario_fim: string
          horario_inicio: string
          id: number
          local: string
          ordem: number | null
        }
        Insert: {
          atividade: string
          cronograma_id: number
          dia: string
          evento_id: string
          global?: boolean
          horario_fim: string
          horario_inicio: string
          id?: number
          local: string
          ordem?: number | null
        }
        Update: {
          atividade?: string
          cronograma_id?: number
          dia?: string
          evento_id?: string
          global?: boolean
          horario_fim?: string
          horario_inicio?: string
          id?: number
          local?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividades_cronograma_id_fkey"
            columns: ["cronograma_id"]
            isOneToOne: false
            referencedRelation: "cronogramas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      cronogramas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          evento_id: string
          id: number
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          evento_id: string
          id?: number
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          evento_id?: string
          id?: number
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronogramas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronogramas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      equipes: {
        Row: {
          created_at: string | null
          created_by: string | null
          evento_id: string | null
          id: number
          modalidade_id: number | null
          nome: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          evento_id?: string | null
          id?: number
          modalidade_id?: number | null
          nome: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          evento_id?: string | null
          id?: number
          modalidade_id?: number | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "equipes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "equipes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          descricao: string
          foto_evento: string | null
          id: string
          nome: string
          status_evento: string
          tipo: string
          updated_at: string | null
          visibilidade_publica: boolean
        }
        Insert: {
          created_at?: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          descricao: string
          foto_evento?: string | null
          id?: string
          nome: string
          status_evento?: string
          tipo: string
          updated_at?: string | null
          visibilidade_publica?: boolean
        }
        Update: {
          created_at?: string | null
          data_fim_inscricao?: string
          data_inicio_inscricao?: string
          descricao?: string
          foto_evento?: string | null
          id?: string
          nome?: string
          status_evento?: string
          tipo?: string
          updated_at?: string | null
          visibilidade_publica?: boolean
        }
        Relationships: []
      }
      eventos_filiais: {
        Row: {
          evento_id: string
          filial_id: string
        }
        Insert: {
          evento_id: string
          filial_id: string
        }
        Update: {
          evento_id?: string
          filial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      filiais: {
        Row: {
          cidade: string
          estado: string
          id: string
          nome: string
        }
        Insert: {
          cidade: string
          estado: string
          id?: string
          nome: string
        }
        Update: {
          cidade?: string
          estado?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      inscricoes_eventos: {
        Row: {
          data_inscricao: string | null
          evento_id: string
          id: string
          selected_role: number
          taxa_inscricao_id: number
          usuario_id: string
        }
        Insert: {
          data_inscricao?: string | null
          evento_id: string
          id?: string
          selected_role: number
          taxa_inscricao_id: number
          usuario_id: string
        }
        Update: {
          data_inscricao?: string | null
          evento_id?: string
          id?: string
          selected_role?: number
          taxa_inscricao_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inscricoes_eventos_perfil"
            columns: ["selected_role"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inscricoes_eventos_taxa_inscricao"
            columns: ["taxa_inscricao_id"]
            isOneToOne: false
            referencedRelation: "taxas_inscricao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      inscricoes_modalidades: {
        Row: {
          atleta_id: string | null
          data_inscricao: string | null
          evento_id: string
          id: number
          justificativa_status: string | null
          modalidade_id: number | null
          status: string | null
        }
        Insert: {
          atleta_id?: string | null
          data_inscricao?: string | null
          evento_id: string
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Update: {
          atleta_id?: string | null
          data_inscricao?: string | null
          evento_id?: string
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      logs_aceite_privacidade: {
        Row: {
          data_aceite: string | null
          id: string
          nome_completo: string
          numero_documento: string
          termo_texto: string
          tipo_documento: string
          usuario_id: string
          versao_termo: string
        }
        Insert: {
          data_aceite?: string | null
          id?: string
          nome_completo: string
          numero_documento: string
          termo_texto: string
          tipo_documento: string
          usuario_id: string
          versao_termo: string
        }
        Update: {
          data_aceite?: string | null
          id?: string
          nome_completo?: string
          numero_documento?: string
          termo_texto?: string
          tipo_documento?: string
          usuario_id?: string
          versao_termo?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_aceite_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_aceite_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "logs_aceite_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "logs_aceite_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "logs_aceite_privacidade_versao_termo_fkey"
            columns: ["versao_termo"]
            isOneToOne: false
            referencedRelation: "termos_privacidade"
            referencedColumns: ["versao_termo"]
          },
          {
            foreignKeyName: "logs_aceite_privacidade_versao_termo_fkey"
            columns: ["versao_termo"]
            isOneToOne: false
            referencedRelation: "vw_latest_termo_privacidade"
            referencedColumns: ["versao_termo"]
          },
        ]
      }
      modalidades: {
        Row: {
          categoria: string
          evento_id: string
          faixa_etaria: string
          grupo: string | null
          id: number
          limite_vagas: number
          nome: string
          status: string
          tipo_modalidade: string
          tipo_pontuacao: string
          vagas_ocupadas: number
        }
        Insert: {
          categoria: string
          evento_id: string
          faixa_etaria?: string
          grupo?: string | null
          id: number
          limite_vagas?: number
          nome: string
          status?: string
          tipo_modalidade: string
          tipo_pontuacao: string
          vagas_ocupadas?: number
        }
        Update: {
          categoria?: string
          evento_id?: string
          faixa_etaria?: string
          grupo?: string | null
          id?: number
          limite_vagas?: number
          nome?: string
          status?: string
          tipo_modalidade?: string
          tipo_pontuacao?: string
          vagas_ocupadas?: number
        }
        Relationships: [
          {
            foreignKeyName: "modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          atleta_id: string | null
          comprovante_url: string | null
          data_criacao: string
          data_validacao: string | null
          evento_id: string | null
          id: number
          isento: boolean
          numero_identificador: string
          status: string | null
          taxa_inscricao_id: number
          validado_sem_comprovante: boolean | null
          valor: number
        }
        Insert: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao: string
          data_validacao?: string | null
          evento_id?: string | null
          id?: number
          isento?: boolean
          numero_identificador: string
          status?: string | null
          taxa_inscricao_id: number
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Update: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao?: string
          data_validacao?: string | null
          evento_id?: string | null
          id?: number
          isento?: boolean
          numero_identificador?: string
          status?: string | null
          taxa_inscricao_id?: number
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "pagamentos_taxa_inscricao_fk"
            columns: ["taxa_inscricao_id"]
            isOneToOne: false
            referencedRelation: "taxas_inscricao"
            referencedColumns: ["id"]
          },
        ]
      }
      papeis_usuarios: {
        Row: {
          evento_id: string
          id: number
          perfil_id: number
          usuario_id: string
        }
        Insert: {
          evento_id: string
          id?: number
          perfil_id: number
          usuario_id: string
        }
        Update: {
          evento_id?: string
          id?: number
          perfil_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "papeis_usuarios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuarios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "papeis_usuarios_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      perfis: {
        Row: {
          descricao: string | null
          evento_id: string
          id: number
          nome: string
          perfil_tipo_id: string
        }
        Insert: {
          descricao?: string | null
          evento_id: string
          id?: number
          nome: string
          perfil_tipo_id: string
        }
        Update: {
          descricao?: string | null
          evento_id?: string
          id?: number
          nome?: string
          perfil_tipo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "perfis_tipo_perfil_fkey"
            columns: ["perfil_tipo_id"]
            isOneToOne: false
            referencedRelation: "perfis_tipo"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_tipo: {
        Row: {
          codigo: string
          descricao: string | null
          id: string
        }
        Insert: {
          codigo: string
          descricao?: string | null
          id?: string
        }
        Update: {
          codigo?: string
          descricao?: string | null
          id?: string
        }
        Relationships: []
      }
      pontuacoes: {
        Row: {
          atleta_id: string | null
          bateria: string | null
          criterio_id: number | null
          data_registro: string | null
          equipe_id: number | null
          evento_id: string
          id: number
          juiz_id: string | null
          medalha: string | null
          modalidade_id: number | null
          observacoes: string | null
          posicao_final: number | null
          unidade: string
          valor_pontuacao: number
        }
        Insert: {
          atleta_id?: string | null
          bateria?: string | null
          criterio_id?: number | null
          data_registro?: string | null
          equipe_id?: number | null
          evento_id: string
          id?: number
          juiz_id?: string | null
          medalha?: string | null
          modalidade_id?: number | null
          observacoes?: string | null
          posicao_final?: number | null
          unidade: string
          valor_pontuacao: number
        }
        Update: {
          atleta_id?: string | null
          bateria?: string | null
          criterio_id?: number | null
          data_registro?: string | null
          equipe_id?: number | null
          evento_id?: string
          id?: number
          juiz_id?: string | null
          medalha?: string | null
          modalidade_id?: number | null
          observacoes?: string | null
          posicao_final?: number | null
          unidade?: string
          valor_pontuacao?: number
        }
        Relationships: [
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_criterio_id_fkey"
            columns: ["criterio_id"]
            isOneToOne: false
            referencedRelation: "criterios_pontuacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      pontuacoes_audit_log: {
        Row: {
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: string
          pontuacao_id: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          pontuacao_id?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          pontuacao_id?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      premiacoes: {
        Row: {
          atleta_id: string | null
          categoria: string
          data_registro: string | null
          evento_id: string
          id: number
          modalidade_id: number | null
          posicao: number
        }
        Insert: {
          atleta_id?: string | null
          categoria: string
          data_registro?: string | null
          evento_id: string
          id?: number
          modalidade_id?: number | null
          posicao: number
        }
        Update: {
          atleta_id?: string | null
          categoria?: string
          data_registro?: string | null
          evento_id?: string
          id?: number
          modalidade_id?: number | null
          posicao?: number
        }
        Relationships: [
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      ranking_filiais: {
        Row: {
          evento_id: string
          filial_id: string | null
          id: number
          total_pontos: number
        }
        Insert: {
          evento_id: string
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Update: {
          evento_id?: string
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      taxas_inscricao: {
        Row: {
          contato_nome: string | null
          contato_telefone: string | null
          data_limite_inscricao: string | null
          evento_id: string
          id: number
          isento: boolean
          link_formulario: string | null
          mostra_card: boolean
          perfil_id: number
          pix_key: string | null
          qr_code_codigo: string | null
          qr_code_image: string | null
          valor: number
        }
        Insert: {
          contato_nome?: string | null
          contato_telefone?: string | null
          data_limite_inscricao?: string | null
          evento_id: string
          id?: number
          isento?: boolean
          link_formulario?: string | null
          mostra_card?: boolean
          perfil_id: number
          pix_key?: string | null
          qr_code_codigo?: string | null
          qr_code_image?: string | null
          valor: number
        }
        Update: {
          contato_nome?: string | null
          contato_telefone?: string | null
          data_limite_inscricao?: string | null
          evento_id?: string
          id?: number
          isento?: boolean
          link_formulario?: string | null
          mostra_card?: boolean
          perfil_id?: number
          pix_key?: string | null
          qr_code_codigo?: string | null
          qr_code_image?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_taxas_inscricao_perfil"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_taxas_perfil"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_inscricao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_inscricao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      taxas_inscricao_perfis: {
        Row: {
          perfil_id: number
          taxa_inscricao_id: number
        }
        Insert: {
          perfil_id: number
          taxa_inscricao_id: number
        }
        Update: {
          perfil_id?: number
          taxa_inscricao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxas_inscricao_perfis_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_inscricao_perfis_taxa_inscricao_id_fkey"
            columns: ["taxa_inscricao_id"]
            isOneToOne: false
            referencedRelation: "taxas_inscricao"
            referencedColumns: ["id"]
          },
        ]
      }
      termos_privacidade: {
        Row: {
          ativo: boolean | null
          data_criacao: string | null
          id: string
          link_pdf: string | null
          termo_texto: string
          versao_termo: string
        }
        Insert: {
          ativo?: boolean | null
          data_criacao?: string | null
          id?: string
          link_pdf?: string | null
          termo_texto: string
          versao_termo: string
        }
        Update: {
          ativo?: boolean | null
          data_criacao?: string | null
          id?: string
          link_pdf?: string | null
          termo_texto?: string
          versao_termo?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          confirmado: boolean | null
          data_criacao: string | null
          data_nascimento: string
          email: string | null
          filial_id: string
          foto_perfil: string | null
          genero: string
          id: string
          nome_completo: string
          numero_documento: string
          telefone: string
          tipo_documento: string
          usuario_registrador_id: string | null
        }
        Insert: {
          confirmado?: boolean | null
          data_criacao?: string | null
          data_nascimento: string
          email?: string | null
          filial_id: string
          foto_perfil?: string | null
          genero?: string
          id?: string
          nome_completo: string
          numero_documento: string
          telefone: string
          tipo_documento: string
          usuario_registrador_id?: string | null
        }
        Update: {
          confirmado?: boolean | null
          data_criacao?: string | null
          data_nascimento?: string
          email?: string | null
          filial_id?: string
          foto_perfil?: string | null
          genero?: string
          id?: string
          nome_completo?: string
          numero_documento?: string
          telefone?: string
          tipo_documento?: string
          usuario_registrador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      usuarios_modalidades_juizes: {
        Row: {
          created_at: string | null
          evento_id: string | null
          id: number
          modalidade_id: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          evento_id?: string | null
          id?: number
          modalidade_id?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          evento_id?: string | null
          id?: number
          modalidade_id?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_modalidades_juizes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_modalidades_juizes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
    }
    Views: {
      view_perfil_atleta: {
        Row: {
          atleta_id: string | null
          data_nascimento: string | null
          data_validacao: string | null
          email: string | null
          evento_id: string | null
          filial_cidade: string | null
          filial_estado: string | null
          filial_id: string | null
          filial_nome: string | null
          foto_perfil: string | null
          genero: string | null
          nome_completo: string | null
          numero_documento: string | null
          numero_identificador: string | null
          pagamento_data_criacao: string | null
          pagamento_status: string | null
          pagamento_valor: number | null
          status_confirmacao: boolean | null
          telefone: string | null
          tipo_documento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      vw_analytics_inscricoes: {
        Row: {
          atletas_por_categoria: Json | null
          evento_id: string | null
          filial: string | null
          filial_id: string | null
          inscritos_por_status_pagamento: Json | null
          media_pontuacao_por_modalidade: Json | null
          modalidades_populares: Json | null
          ranking_filiais: Json | null
          registros_por_filial: Json | null
          total_inscritos_geral: number | null
          total_inscritos_modalidades: number | null
          total_inscritos_por_status: Json | null
          valor_total_pago: number | null
          valor_total_pendente: number | null
        }
        Relationships: []
      }
      vw_athletes_management: {
        Row: {
          atleta_id: string | null
          email: string | null
          evento_id: string | null
          filial_id: string | null
          filial_nome: string | null
          genero: string | null
          inscricao_id: number | null
          justificativa_status: string | null
          modalidade_nome: string | null
          nome_atleta: string | null
          numero_documento: string | null
          numero_identificador: string | null
          registrador_email: string | null
          registrador_nome: string | null
          status_confirmacao: boolean | null
          status_inscricao: string | null
          status_pagamento: string | null
          telefone: string | null
          tipo_documento: string | null
          usuario_registrador_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fk"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "usuarios_registrador_fkey"
            columns: ["usuario_registrador_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      vw_cronograma_atividades: {
        Row: {
          atividade: string | null
          dia: string | null
          evento_id: string | null
          global: boolean | null
          horario_fim: string | null
          horario_inicio: string | null
          id: number | null
          local: string | null
          modalidade_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      vw_cronograma_atividades_por_atleta: {
        Row: {
          atividade: string | null
          atleta_id: string | null
          cronograma_atividade_id: number | null
          dia: string | null
          evento_id: string | null
          global: boolean | null
          horario_fim: string | null
          horario_inicio: string | null
          local: string | null
          modalidade_nome: string | null
          modalidade_status: string | null
        }
        Relationships: []
      }
      vw_latest_termo_privacidade: {
        Row: {
          data_criacao: string | null
          termo_texto: string | null
          versao_termo: string | null
        }
        Insert: {
          data_criacao?: string | null
          termo_texto?: string | null
          versao_termo?: string | null
        }
        Update: {
          data_criacao?: string | null
          termo_texto?: string | null
          versao_termo?: string | null
        }
        Relationships: []
      }
      vw_modalidades_atletas_confirmados: {
        Row: {
          atleta_email: string | null
          atleta_id: string | null
          atleta_nome: string | null
          atleta_telefone: string | null
          categoria: string | null
          evento_id: string | null
          modalidade_id: number | null
          modalidade_nome: string | null
          numero_documento: string | null
          numero_identificador: string | null
          pagamento_id: number | null
          tipo_documento: string | null
          tipo_modalidade: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      vw_pontuacoes_detalhadas: {
        Row: {
          atleta_id: string | null
          atleta_nome: string | null
          bateria: string | null
          data_registro: string | null
          equipe_id: number | null
          equipe_nome: string | null
          evento_id: string | null
          filial_id: string | null
          filial_nome: string | null
          juiz_id: string | null
          juiz_nome: string | null
          medalha: string | null
          modalidade_categoria: string | null
          modalidade_id: number | null
          modalidade_nome: string | null
          pontuacao_id: number | null
          posicao_final: number | null
          unidade: string | null
          valor_pontuacao: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_modalidades_atletas_confirmados"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      vw_pontuacoes_gerais_atletas: {
        Row: {
          atleta_id: string | null
          atleta_nome: string | null
          modalidade_categoria: string | null
          modalidade_id: number | null
          modalidade_nome: string | null
          modalidade_tipo: string | null
          pontuacao_media: number | null
          pontuacao_total: number | null
          total_pontuacoes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_profiles: {
        Args:
          | { p_user_id: string; p_profile_ids: number[] }
          | { p_user_id: string; p_profile_ids: number[]; p_event_id: string }
        Returns: undefined
      }
      atualizar_status_inscricao: {
        Args: {
          inscricao_id: number
          novo_status: string
          justificativa: string
        }
        Returns: undefined
      }
      atualizar_status_pagamento: {
        Args: { p_atleta_id: string; p_novo_status: string }
        Returns: undefined
      }
      get_current_event: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_role_priority: {
        Args: { role_name: string }
        Returns: number
      }
      has_profile: {
        Args: { user_id: string; profile_name: string }
        Returns: boolean
      }
      is_delegation_rep: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_event_admin: {
        Args: { user_id: string; event_id: string }
        Returns: boolean
      }
      is_judge: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_dependent_registration: {
        Args:
          | { p_dependent_id: string; p_event_id: string; p_birth_date: string }
          | {
              p_dependent_id: string
              p_event_id: string
              p_birth_date: string
              p_profile_id: number
            }
        Returns: undefined
      }
      process_event_registration: {
        Args: {
          p_user_id: string
          p_event_id: string
          p_profile_id: number
          p_registration_fee_id: number
        }
        Returns: undefined
      }
      register_score: {
        Args: {
          p_evento_id: string
          p_modalidade_id: number
          p_atleta_id: string
          p_juiz_id: string
          p_valor_pontuacao: number
          p_posicao_final: number
          p_medalha?: string
          p_unidade?: string
          p_bateria?: string
          p_observacoes?: string
          p_equipe_id?: number
        }
        Returns: number
      }
      set_current_event: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      swap_user_profile: {
        Args: {
          p_user_id: string
          p_event_id: string
          p_new_profile_id: number
          p_old_profile_id: number
        }
        Returns: undefined
      }
      sync_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_roles_reverse: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_belongs_to_branch: {
        Args: { user_id: string; branch_id: string }
        Returns: boolean
      }
    }
    Enums: {
      perfil_tipo:
        | "Administração"
        | "Organizador"
        | "Atleta"
        | "Representante de Delegação"
        | "Público Geral"
        | "PGR"
        | "ATL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      perfil_tipo: [
        "Administração",
        "Organizador",
        "Atleta",
        "Representante de Delegação",
        "Público Geral",
        "PGR",
        "ATL",
      ],
    },
  },
} as const
