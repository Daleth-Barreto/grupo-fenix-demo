import type { GalleryEvent } from '../types'

export const MOCK_GALLERY: GalleryEvent[] = [
  {
    id: 'g1',
    title: 'Congreso de Neurodesarrollo 2025',
    category: 'Congreso',
    year: 2025,
    location: 'Puebla, Puebla',
    cover_url: '/events/neurodesarrollo.jpeg',
    photos: ['/events/neurodesarrollo.jpeg'],
    attendees: 350,
  },
  {
    id: 'g2',
    title: 'Congreso de Sexualidad y Psicoterapia 2024',
    category: 'Congreso',
    year: 2024,
    location: 'San Cristóbal de las Casas',
    cover_url: '/events/sexualidad.jpg',
    photos: ['/events/sexualidad.jpg'],
    attendees: 280,
  },
  {
    id: 'g3',
    title: 'Congreso de Tanatología 2024',
    category: 'Congreso',
    year: 2024,
    location: 'Guadalajara, Jalisco',
    cover_url: '/events/tanatologia.png',
    photos: ['/events/tanatologia.png'],
    attendees: 310,
  },
  {
    id: 'g4',
    title: 'Congreso de Psicooncología 2023',
    category: 'Congreso',
    year: 2023,
    location: 'Guadalajara, Jalisco',
    cover_url: '/events/psicooncologia.png',
    photos: ['/events/psicooncologia.png'],
    attendees: 250,
  },
]
