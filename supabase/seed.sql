-- Demo Data for HomeFlow
-- Run this after the initial schema migration

-- Insert demo agent profiles
-- Note: In production, these would be created via auth.users first
-- For demo purposes, we'll insert them directly with hardcoded UUIDs

-- Agent 1: Mamadou Diallo (Verified)
INSERT INTO public.profiles (id, full_name, phone, role, is_verified, bio, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Mamadou Diallo', '+224 620 123 456', 'demarcheur', true, 'Spécialiste immobilier à Conakry depuis 10 ans. Je vous accompagne dans tous vos projets immobiliers avec professionnalisme et transparence.', NOW() - INTERVAL '1 year');

-- Agent 2: Aissatou Barry (Verified)
INSERT INTO public.profiles (id, full_name, phone, role, is_verified, bio, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Aissatou Barry', '+224 621 234 567', 'demarcheur', true, 'Je vous aide à trouver le logement parfait qui correspond à vos besoins et votre budget. Contact rapide et visites organisées rapidement.', NOW() - INTERVAL '6 months');

-- Agent 3: Ibrahima Sow (Pending verification)
INSERT INTO public.profiles (id, full_name, phone, role, is_verified, bio, created_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Ibrahima Sow', '+224 622 345 678', 'demarcheur', false, 'Agent immobilier débutant motivé. Disponible pour vous faire visiter les meilleures propriétés de Conakry.', NOW() - INTERVAL '1 month');

-- Test tenant user
INSERT INTO public.profiles (id, full_name, phone, role, is_verified, bio, created_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'Fatoumata Camara', '+224 623 456 789', 'locataire', false, NULL, NOW() - INTERVAL '3 months');

-- Insert verification records
INSERT INTO public.verifications (user_id, status, submitted_at, reviewed_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'verified', NOW() - INTERVAL '11 months', NOW() - INTERVAL '11 months'),
  ('22222222-2222-2222-2222-222222222222', 'verified', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months'),
  ('33333333-3333-3333-3333-333333333333', 'pending', NOW() - INTERVAL '2 days', NULL);

-- Insert demo properties

-- Property 1: Villa moderne 4 pièces avec jardin
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Villa moderne 4 pièces avec jardin',
  'Magnifique villa moderne située dans le quartier résidentiel de Kipé. Cette propriété spacieuse dispose de 4 grandes chambres, un salon lumineux, une cuisine équipée, et un beau jardin privé. Idéale pour une famille. Parking sécurisé pour 2 véhicules. Eau et électricité disponibles.',
  'location',
  5500000,
  'Kipé',
  'Conakry',
  4,
  320,
  true,
  true,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  true,
  'active'
);

-- Property 2: Appartement F3 standing
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Appartement F3 standing',
  'Bel appartement F3 dans un immeuble moderne à Nongo. Comprend 3 chambres climatisées, un séjour spacieux, une cuisine américaine, et une salle de bain moderne. Parking privé inclus. Quartier calme et sécurisé.',
  'location',
  2800000,
  'Nongo',
  'Conakry',
  3,
  95,
  true,
  false,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  true,
  'active'
);

-- Property 3: Studio meublé proche centre
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Studio meublé proche centre-ville',
  'Studio cosy entièrement meublé au cœur de Kaloum. Parfait pour une personne seule ou un couple. Cuisine équipée, salle de bain privée, climatisation. À proximité des commerces, banques et administrations. Disponible immédiatement.',
  'location',
  1500000,
  'Kaloum',
  'Conakry',
  1,
  35,
  false,
  true,
  ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
  false,
  'active'
);

-- Property 4: Maison familiale 5 pièces
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Maison familiale 5 pièces à vendre',
  'Grande maison familiale à vendre à Lambanyi. 5 chambres spacieuses, 2 salons, cuisine moderne, 3 salles de bain. Grand terrain avec jardin et espace pour parking multiple. Construction solide en excellent état. Titre foncier disponible.',
  'achat',
  850000000,
  'Lambanyi',
  'Conakry',
  5,
  450,
  true,
  false,
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
  true,
  'active'
);

-- Property 5: Duplex de luxe vue mer
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Duplex de luxe avec vue mer',
  'Duplex haut standing au Cameroun avec vue imprenable sur la mer. 4 chambres dont une suite parentale, 2 salons, cuisine équipée, grande terrasse. Finitions luxueuses, climatisation centrale, groupe électrogène. Résidence sécurisée 24h/24.',
  'location',
  8000000,
  'Cameroun',
  'Conakry',
  4,
  200,
  true,
  true,
  ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'],
  true,
  'active'
);

-- Property 6: Appartement F2 économique
INSERT INTO public.properties (user_id, title, description, type, price, quartier, ville, pieces, surface, parking, meuble, images, is_featured, status)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Appartement F2 économique',
  'Appartement F2 simple et propre à Cosa. 2 chambres, salon, cuisine, salle de bain. Idéal pour petit budget. Quartier animé avec accès facile aux transports. Eau courante et électricité.',
  'location',
  1800000,
  'Cosa',
  'Conakry',
  2,
  55,
  false,
  false,
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
  false,
  'active'
);

-- Insert demo reviews for agents

-- Reviews for Mamadou Diallo
INSERT INTO public.reviews (demarcheur_id, author_id, rating, comment, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 5, 'Excellent agent! M. Diallo m''a aidé à trouver l''appartement parfait en moins d''une semaine. Très professionnel et à l''écoute.', NOW() - INTERVAL '2 months'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 5, 'Je recommande vivement! Transactions transparentes et rapides. Merci pour votre aide précieuse.', NOW() - INTERVAL '4 months'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 4, 'Très bon service. Réactif et connait très bien le marché immobilier de Conakry.', NOW() - INTERVAL '7 months');

-- Reviews for Aissatou Barry
INSERT INTO public.reviews (demarcheur_id, author_id, rating, comment, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 5, 'Mme Barry est formidable! Elle a pris le temps de comprendre mes besoins et m''a trouvé exactement ce que je cherchais.', NOW() - INTERVAL '1 month'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 5, 'Service impeccable du début à la fin. Très professionnelle et sympathique. Je la recommande les yeux fermés!', NOW() - INTERVAL '3 months');

-- Insert some demo favorites
INSERT INTO public.favorites (user_id, property_id)
SELECT '44444444-4444-4444-4444-444444444444', id 
FROM public.properties 
WHERE quartier IN ('Kipé', 'Nongo')
LIMIT 2;

-- Insert demo conversation and messages
INSERT INTO public.conversations (id, property_id, participant_1, participant_2, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
   (SELECT id FROM public.properties WHERE title = 'Villa moderne 4 pièces avec jardin' LIMIT 1),
   '44444444-4444-4444-4444-444444444444',
   '11111111-1111-1111-1111-111111111111',
   NOW() - INTERVAL '2 days');

INSERT INTO public.messages (conversation_id, sender_id, content, is_read, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Bonjour, je suis intéressée par cette villa. Est-elle toujours disponible?', true, NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Bonjour! Oui, la villa est toujours disponible. Quand seriez-vous disponible pour une visite?', true, NOW() - INTERVAL '1 day 23 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Je serais disponible demain après-midi si possible.', false, NOW() - INTERVAL '1 day 22 hours');

-- Update statistics (this would normally be done by triggers/functions in production)
-- For demo purposes, we're setting some view counts and stats manually

COMMENT ON TABLE public.properties IS 'Properties table with demo data - 6 properties across Conakry';
COMMENT ON TABLE public.profiles IS 'User profiles - 3 demo agents and 1 demo tenant';
COMMENT ON TABLE public.reviews IS 'Reviews table - 5 demo reviews for verified agents';
