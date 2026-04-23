CREATE TABLE IF NOT EXISTS produtos (
  id            TEXT        PRIMARY KEY,
  nome          TEXT        NOT NULL,
  preco         NUMERIC     NOT NULL DEFAULT 0,
  preco_antigo  NUMERIC,
  categoria     TEXT        NOT NULL,
  descricao     TEXT        NOT NULL,
  imagem        TEXT,
  destaque      BOOLEAN     NOT NULL DEFAULT false,
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  em_promocao   BOOLEAN     NOT NULL DEFAULT false,
  tipo          TEXT        NOT NULL CHECK (tipo IN ('produto', 'servico', 'medicamento')),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS info_farmacia (
  id            INTEGER     PRIMARY KEY DEFAULT 1,
  nome          TEXT        NOT NULL DEFAULT 'RC Farma',
  slogan        TEXT        NOT NULL DEFAULT 'A sua farmácia clínica',
  telefone      TEXT        NOT NULL DEFAULT '',
  whatsapp      TEXT        NOT NULL DEFAULT '',
  endereco      TEXT        NOT NULL DEFAULT '',
  horario       TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT        PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO info_farmacia (id, nome, slogan, telefone, whatsapp, endereco, horario, email)
VALUES (
  1,
  'RC Farma',
  'A sua farmácia clínica',
  '(99) 981058365',
  '99981058365',
  'Rua Iraí Irmão, nº 400 - Bairro São João - Timon/MA',
  'Segunda a Sexta: 7h às 20h' || E'\n' || 'Fechado aos Sábados',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO produtos (id, nome, preco, categoria, descricao, destaque, ativo, tipo) VALUES
  ('serv-1', 'Consultas Farmacêuticas', 0, 'Serviços Clínicos',
   'Orientação profissional sobre medicamentos, interações e uso racional. Atendimento personalizado com nosso farmacêutico.',
   true, true, 'servico'),
  ('serv-2', 'Aferição de Pressão', 0, 'Serviços Clínicos',
   'Medição da pressão arterial com equipamento digital homologado. Rápido, preciso e gratuito.',
   true, true, 'servico'),
  ('serv-3', 'Teste de Glicemia', 0, 'Serviços Clínicos',
   'Monitoramento da glicose no sangue. Ideal para diabéticos e prevenção. Resultado em segundos.',
   true, true, 'servico'),
  ('serv-4', 'Injetáveis', 0, 'Serviços Clínicos',
   'Aplicação de injeções intramusculares e subcutâneas com segurança e higiene. Traga sua prescrição.',
   true, true, 'servico'),
  ('serv-5', 'Medicamentos em Geral', 0, 'Medicamentos',
   'Grande variedade de medicamentos de referência, genéricos e similares. Orientação na compra incluída.',
   true, true, 'servico')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE produtos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_farmacia  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_limpar_sessoes ON admin_sessions;
CREATE TRIGGER tr_limpar_sessoes
  AFTER INSERT ON admin_sessions
  FOR EACH STATEMENT EXECUTE FUNCTION limpar_sessoes_expiradas();
