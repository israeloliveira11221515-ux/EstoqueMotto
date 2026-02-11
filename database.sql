
-- Habilitar pgcrypto para hash de PIN
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Configurações Globais do Sistema (Singleton)
CREATE TABLE settings_system (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  workshop_name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  address_street TEXT NOT NULL,
  address_number TEXT NOT NULL,
  address_neighborhood TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,
  logo_url TEXT,
  manager_name TEXT NOT NULL,
  gestor_pin_hash TEXT NOT NULL,
  max_discount_sem_pin INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos (Estoque)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  price_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_sell DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendas
CREATE TYPE sale_status AS ENUM ('ABERTA', 'PAGA', 'CANCELADA');
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status sale_status DEFAULT 'ABERTA',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_value DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  actor_type TEXT NOT NULL, -- 'GESTOR' ou 'OPERACIONAL'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da Venda
CREATE TABLE sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal_item DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Pagamentos
CREATE TYPE payment_method AS ENUM ('PIX', 'CREDITO');
CREATE TABLE sale_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  installments INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentações de Estoque (Auditoria)
CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'ENTRADA', 'SAIDA', 'AJUSTE'
  actor_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tentativas de PIN (Segurança)
CREATE TABLE pin_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para validar PIN do GESTOR
CREATE OR REPLACE FUNCTION verify_gestor_pin(p_pin TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
  v_hash TEXT;
  v_failures INTEGER;
BEGIN
  -- Verificar bloqueio (5 falhas / 5 min)
  SELECT COUNT(*) INTO v_failures FROM pin_attempts 
  WHERE success = false AND attempted_at > NOW() - INTERVAL '5 minutes';
  
  IF v_failures >= 5 THEN RAISE EXCEPTION 'Bloqueado por excesso de tentativas.'; END IF;

  SELECT gestor_pin_hash INTO v_hash FROM settings_system WHERE id = 1;
  
  IF v_hash = crypt(p_pin, v_hash) THEN
    INSERT INTO pin_attempts (success) VALUES (true);
    RETURN TRUE;
  ELSE
    INSERT INTO pin_attempts (success) VALUES (false);
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
