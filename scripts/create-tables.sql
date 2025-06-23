-- Crear tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  pagado_por TEXT NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de objetivos
CREATE TABLE IF NOT EXISTS objetivos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  monto_ahorrado DECIMAL(10,2) DEFAULT 0,
  fecha_objetivo DATE NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de lugares
CREATE TABLE IF NOT EXISTS lugares (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  notas TEXT DEFAULT '',
  puntaje INTEGER CHECK (puntaje >= 1 AND puntaje <= 5),
  visitado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos de ejemplo
INSERT INTO gastos (descripcion, monto, categoria, pagado_por, fecha) VALUES
('Cena romántica', 85.00, 'comida', 'Melina', '2024-01-15'),
('Alquiler enero', 1200.00, 'alquiler', 'Tomas', '2024-01-01'),
('Regalo aniversario', 150.00, 'regalo', 'Melina', '2024-01-10'),
('Uber al aeropuerto', 45.00, 'transporte', 'Tomas', '2024-01-12');

INSERT INTO objetivos (nombre, monto_total, monto_ahorrado, fecha_objetivo) VALUES
('Viaje a Japón', 5000.00, 2300.00, '2024-12-01'),
('Sillas nuevas', 800.00, 450.00, '2024-06-15'),
('Cámara profesional', 1200.00, 200.00, '2024-08-01');

INSERT INTO lugares (nombre, categoria, ciudad, notas, puntaje, visitado) VALUES
('Café Central', 'cafe', 'Buenos Aires', 'El mejor cortado de la ciudad, volvamos en otoño', 5, true),
('Restaurante Vista Mar', 'restaurante', 'Mar del Plata', 'Increíble vista al atardecer, perfecto para aniversarios', 4, false),
('Villa General Belgrano', 'pueblo', 'Córdoba', 'Pueblo alemán encantador, ideal para octubre', 5, true);
