// Contenido institucional tomado de https://www.eventosgrupofenix.com/ (revisado el 31 de octubre de 2026).
const IMAGES = `${import.meta.env.PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/media/sitio`
const image = (name: string) => `${IMAGES}/${name}.jpg`

export const CONTACTO = {
  email: 'atencion@eventosgrupofenix.com',
  instagram: { label: '@eventosgrupo_fenix', url: 'https://www.instagram.com/eventosgrupo_fenix/' },
  facebook: { label: 'congresosfenix', url: 'https://www.facebook.com/congresosfenix' },
  web: 'https://www.eventosgrupofenix.com/',
  pagos: 'Transferencias y depósito en efectivo. Contamos con facturación.',
}

export const FILOSOFIA = {
  lema: 'Aprender para dejar huella',
  texto: 'Creamos espacios de encuentro donde estudiantes y especialistas comparten conocimientos, experiencias e ideas. A través de nuestros congresos, talleres, certificaciones y capacitaciones, impulsamos el desarrollo personal y profesional con un enfoque humano.',
}

export interface EventoPasado {
  slug: string
  titulo: string
  fechas: string | null
  anio: number | null
  lugar: string
  sede: string | null
  direccion: string | null
  lema: string
  resumen: string
  ponentes: string[]
  asistentes: number | null
  imagen: string
}

export const TRAYECTORIA: EventoPasado[] = [
  {
    slug: 'neurodesarrollo',
    titulo: '1er. Congreso Internacional de Neurodesarrollo y Neuroeducación',
    fechas: '21 al 24 de mayo de 2026',
    anio: 2026,
    lugar: 'Puebla, Puebla',
    sede: 'Camino Real Puebla Angelópolis',
    direccion: 'La Vista, Cipreses de Mayorazgo, 72810, Heroica Puebla de Zaragoza, México',
    lema: 'El neurodesarrollo estudia cómo el cerebro se forma, madura y adapta a lo largo de la vida.',
    resumen: 'El neurodesarrollo abarca desde la infancia hasta la adultez. La neuroeducación integra hallazgos de la neurociencia en las prácticas educativas para optimizar la enseñanza y el aprendizaje. El congreso reunió a especialistas en neurodesarrollo infantil.',
    ponentes: ['Dra. Alicia Vargas', 'Dra. Yulia Solovieva', 'Dra. María Teresa Lomelí Hernández', 'Dra. Carla Morales', 'Mtra. Gabriela Vargas', 'Mtra. Olga Leticia Galicia García', 'Mtro. Edinson González', 'Mtra. Fidelia Galvis Gómez'],
    asistentes: 220,
    imagen: image('neurodesarrollo'),
  },
  {
    slug: 'tanatologia-1',
    titulo: '1er. Congreso Nacional de Tanatología',
    fechas: '26 al 29 de marzo de 2026',
    anio: 2026,
    lugar: 'San Cristóbal de las Casas, Chiapas',
    sede: 'Centro de Convenciones El Carmen',
    direccion: 'Hermanos Domínguez s/n, Zona Centro, 29220, Chiapas, México',
    lema: 'La Tanatología es una disciplina fundamental en la actualidad para la atención de la muerte y el duelo.',
    resumen: 'La Tanatología aborda los aspectos biológicos, psicológicos y sociales de la muerte y el duelo. Busca mejorar la atención al final de la vida, reducir el sufrimiento y promover la conciencia y la educación sobre la pérdida. El congreso reunió a especialistas en duelo, crisis y acompañamiento tanatológico.',
    ponentes: ['Dra. Amalia Osorio', 'Dra. Abril Dorantes', 'Mtra. Araceli Chávez', 'Mtro. Armando Quiróz', 'Mtra. Gracia Corkidi', 'Mtro. Alejandro Urióstegui', "Psic. Cecilia O'Farrill"],
    asistentes: 500,
    imagen: image('tanatologia-1'),
  },
  {
    slug: 'sexualidad-2',
    titulo: '2do. Congreso de Sexualidad y Psicoterapia',
    fechas: '20 de noviembre de 2025',
    anio: 2025,
    lugar: 'Playa del Carmen, Quintana Roo',
    sede: 'City Express by Marriott',
    direccion: 'Av. Balamkanche, Manzana 30, Lote 4-II, Playacar, 77710, Playa del Carmen, Q.R., México',
    lema: '¡Siempre en la búsqueda de nuevas y emocionantes inspiraciones!',
    resumen: 'Reunió a especialistas en sexología, terapia de pareja y psicoterapia. A través de conferencias y workshops, los asistentes exploraron la sexualidad humana, los vínculos y la salud emocional desde distintos enfoques profesionales.',
    ponentes: ['Dr. Eduardo Calixto', 'Sex. Irene Moreno', 'Dr. David Barrios', 'Dr. Salvador Camacho', 'Mtra. Yohaly Narváez', 'Profe. Juan Talamantes', 'Sex. Mariel Segovia', 'Psic. Alberto Bustamante'],
    asistentes: null,
    imagen: image('sexualidad-2'),
  },
  {
    slug: 'criminal-2',
    titulo: '2do. Congreso de Psicología Criminal y Forense',
    fechas: '5 al 8 de junio de 2025',
    anio: 2025,
    lugar: 'Puebla, Puebla',
    sede: 'Holiday Inn La Noria',
    direccion: 'Circuito Juan Pablo II 1936, Col. Ex Hacienda La Noria, 72410, Puebla, México',
    lema: 'Un encuentro especializado con invitado especial: Dr. Guillermo Fouce.',
    resumen: 'Reunió a especialistas nacionales e internacionales. Las conferencias y workshops abordaron neuropsicología forense, victimología criminal, psicología de la psicopatía, psicología del testimonio e investigación forense de falsas acusaciones.',
    ponentes: ['Dra. Olga Leticia Galicia', 'Dra. Gloria López', 'Dra. Thalia Ramos', 'Dr. Aurelio Coronado', 'Dr. Víctor Nodal', 'Mtro. Manuel Galván', 'Mtra. Karla Valeria', 'Dr. Guillermo Fouce'],
    asistentes: null,
    imagen: image('criminal-2'),
  },
  {
    slug: 'ansiedad-2',
    titulo: '2do. Congreso Nacional de Ansiedad, Depresión y Estrés',
    fechas: '6 al 9 de febrero de 2025',
    anio: 2025,
    lugar: 'Acapulco, Guerrero',
    sede: 'Plaza Suites Acapulco',
    direccion: 'Av. Costera Miguel Alemán 123, Fracc. Magallanes, 39670, Acapulco de Juárez, Gro.',
    lema: 'Un congreso para comprender y afrontar la ansiedad, la depresión y el estrés desde distintos enfoques.',
    resumen: 'Reunió a especialistas en salud mental para compartir conferencias magistrales y herramientas prácticas desde enfoques clínicos, educativos y personales. Un espacio de aprendizaje frente al mar para cuidar la salud mental.',
    ponentes: ['Dr. Eduardo Calixto', 'Profe. Talamantes', 'Dr. Darío Rodríguez', 'Dra. Amalia Osorio', 'Dra. Abril Dorantes', "Psic. Cecilia O'Farrill", 'Lic. Norely Murillo', 'Psic. Alberto Bustamante'],
    asistentes: 160,
    imagen: image('ansiedad-2'),
  },
  {
    slug: 'sexualidad-1',
    titulo: '1er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja',
    fechas: '22 y 23 de noviembre de 2024',
    anio: 2024,
    lugar: 'San Cristóbal de las Casas, Chiapas',
    sede: 'Casa Mazariegos',
    direccion: 'Crescencio Rosas 4, Zona Centro, 29200, San Cristóbal de las Casas, Chiapas',
    lema: 'El primer encuentro de Grupo Fénix sobre sexualidad y psicoterapia.',
    resumen: 'Reunió a sexólogos, terapeutas y psicólogos para hablar de sexualidad, pareja y familia, con conferencias y talleres de especialistas en terapia de pareja, mediación familiar y sexología clínica.',
    ponentes: ['Irene Moreno', 'Oliver Chávez', 'David Barrios', 'Yohaly Narváez', 'Daniela Navarrete', 'Alberto Bustamante'],
    asistentes: 200,
    imagen: image('sexualidad-1'),
  },
  {
    slug: 'ansiedad-1',
    titulo: '1er. Congreso Nacional de Ansiedad, Depresión y Estrés',
    fechas: '22 al 26 de mayo de 2024',
    anio: 2024,
    lugar: 'Playa del Carmen, Quintana Roo',
    sede: 'City Express by Marriott Playa del Carmen',
    direccion: 'Av. Balamkanche Lt 4, Mza 30, Fraccionamiento Playacar Fase II, Solidaridad, Quintana Roo, 77710',
    lema: 'Liberando mentes, superando barreras.',
    resumen: 'Dirigido a estudiantes, profesionales de la salud, psicólogos, pedagogos, administradores y recursos humanos. Técnicas para hacer frente a la ansiedad, el estrés y la depresión, con enfoques profesionales y personales.',
    ponentes: ['Dr. Darío Rodríguez Barrera', 'Mtra. Gracia Corkidi Nakach', 'Mtro. Armando Quiroz Adame', 'Dra. Blanca Elízabeth Ruvalcaba Ramos', 'Mtra. Georgina Salazar Bustamante', 'Mtra. Diana Esthela Yunes Vélez', 'Mtra. Margarita Muñoz Levaro', 'Lic. Ana Cecilia O Farrill Castro'],
    asistentes: null,
    imagen: image('ansiedad-1'),
  },
  {
    slug: 'criminal-1',
    titulo: '1er. Congreso Nacional de Psicología Criminal y Forense',
    fechas: '16 al 19 de mayo de 2024',
    anio: 2024,
    lugar: 'Puebla, Puebla',
    sede: 'Holiday Inn La Noria',
    direccion: 'Circuito Juan Pablo II 1936, Col. Ex Hacienda La Noria, 72410, Puebla, México',
    lema: 'La mente detrás del crimen.',
    resumen: 'Un congreso con especialistas en psicología forense, penitenciaria y atención a víctimas del delito. Los asistentes aprendieron a identificar conductas antes y después de un crimen y a analizar los efectos del delito sobre la víctima.',
    ponentes: ['Dr. Aurelio Coronado Mares', 'Mtro. Emilio González Soto', 'Mtro. Sergio Daniel Solares Barbosa', 'Mtro. Manuel Galván Castañeda'],
    asistentes: 180,
    imagen: image('criminal-1'),
  },
  {
    slug: 'desnudando-sexualidad',
    titulo: '1er. Congreso Internacional Desnudando la Sexualidad',
    fechas: null,
    anio: null,
    lugar: 'En línea',
    sede: null,
    direccion: null,
    lema: 'Donde el placer y la palabra se encuentran.',
    resumen: 'Un congreso internacional en línea, en colaboración con Sexualia, que reunió a expertos de seis países. Con conferencias, paneles y talleres interactivos para desafiar mitos, ampliar conocimientos y fomentar una visión más inclusiva y respetuosa de la sexualidad.',
    ponentes: ['David Barrios Martínez', 'Pablo Martínez Castillo', 'Ana María Ocaña Castañeda', 'Óscar Chávez Lanz', 'Dominique Gay-Sylvestre', 'Oswaldo Rodrigues Jr', 'Carmen Saura', 'Marco Petragnani Gelosi', 'Y más de 20 ponentes nacionales e internacionales'],
    asistentes: null,
    imagen: image('desnudando-sexualidad'),
  },
]

export interface Tema {
  titulo: string
  texto: string
  norma?: string
}

export interface Capacitacion {
  id: string
  titulo: string
  subtitulo: string
  descripcion: string
  imagen: string
  temas: Tema[]
}

export const CAPACITACION_INTRO = 'Diseñamos soluciones a medida que potencian la conexión, el liderazgo y la ejecución efectiva en cada equipo, creando experiencias formativas que impulsan la comunicación y la eficiencia en equipos empresariales.'

export const CAPACITACION_BENEFICIOS = [
  { titulo: 'Compromiso y productividad', texto: 'Aumenta el compromiso y la productividad en un periodo definido.' },
  { titulo: 'Trabajo colaborativo', texto: 'Fomenta un entorno colaborativo donde cada equipo se sienta responsable de sus resultados.' },
  { titulo: 'Mejor comunicación', texto: 'Reduce fricción, errores y mejora la comunicación entre las áreas de tu empresa.' },
]

export const CAPACITACIONES: Capacitacion[] = [
  {
    id: 'salud-mental',
    titulo: 'Salud mental en el trabajo',
    subtitulo: 'Un ambiente de trabajo más empático',
    descripcion: 'Herramientas prácticas para identificar, manejar y prevenir el estrés, la ansiedad y otros desafíos emocionales.',
    imagen: image('salud-mental'),
    temas: [
      { titulo: 'Manejo del estrés y resiliencia en ambientes laborales', texto: 'Identificar, reducir y afrontar las presiones del trabajo, manteniendo el equilibrio mental y la capacidad de adaptarse y recuperarse.', norma: 'Implementación de la NOM-035' },
      { titulo: 'Liderazgo empático', texto: 'Desarrolla líderes con escucha activa, comunicación asertiva y empatía en la toma de decisiones.' },
      { titulo: 'Comunicación efectiva en equipos multiculturales', texto: 'Sensibilidad, lenguaje inclusivo y resolución de malentendidos para que cada voz sea entendida y valorada.' },
      { titulo: 'Acompañamiento en procesos de duelo o crisis', texto: 'Apoyo emocional con escucha activa, empatía y contención, respetando los tiempos y emociones de cada persona.' },
    ],
  },
  {
    id: 'gestion-calidad',
    titulo: 'Gestión de calidad',
    subtitulo: 'Excelencia en cada proceso',
    descripcion: 'Enseña a tu equipo a implementar procesos que garanticen la excelencia en productos o servicios.',
    imagen: image('gestion-calidad'),
    temas: [
      { titulo: 'Calidad', texto: 'Principios, herramientas y estándares: gestión de procesos, mejora continua, cumplimiento de normas y resolución de problemas.', norma: 'Implementación de la ISO-9001' },
      { titulo: 'Mejora continua', texto: 'Una cultura para identificar oportunidades de optimización y medir resultados con herramientas prácticas.', norma: 'Implementación de la ISO-9001' },
      { titulo: 'Control de procesos', texto: 'Documentar, estandarizar y supervisar cada etapa de trabajo, y decidir con base en datos.', norma: 'Implementación de la ISO-9001' },
      { titulo: 'Auditorías internas', texto: 'Planear y realizar auditorías, identificar hallazgos, proponer acciones correctivas y dar seguimiento.', norma: 'Implementación de la ISO-9001' },
    ],
  },
  {
    id: 'proteccion-civil',
    titulo: 'Seguridad y protección civil',
    subtitulo: 'Equipos preparados ante cualquier emergencia',
    descripcion: 'Prepara a tu equipo para prevenir y responder ante emergencias, como incendios, sismos u otros riesgos.',
    imagen: image('proteccion-civil'),
    temas: [
      { titulo: 'Primeros auxilios', texto: 'Evaluar situaciones, brindar atención inmediata y estabilizar a una persona: RCP, hemorragias, heridas y fracturas.', norma: 'Implementación de la NOM-005-STPS-1998' },
      { titulo: 'Combate contra incendios', texto: 'Riesgos de fuego, uso de extintores, equipos de protección y coordinación con brigadas de emergencia.', norma: 'Implementación de la NOM-002-STPS-2010' },
      { titulo: 'Simulacro de evacuación', texto: 'Un plan de evacuación personalizado, con protocolos claros y simulacros prácticos.', norma: 'Implementación de la NOM-002-STPS-2010' },
      { titulo: 'Búsqueda y rescate', texto: 'Técnicas de localización, rescate seguro y primeros auxilios básicos, con entrenamientos prácticos.', norma: 'Implementación de la NOM-002-STPS-2010' },
    ],
  },
]

export interface Certificacion {
  id: string
  titulo: string
  subtitulo: string
  imagen: string
  detalles: string[]
  objetivo: string
  paraQuien: string[]
  incluye: string[]
  talleres: Array<{ titulo: string; lema: string; horas: number }>
  testimonios: Array<{ nombre: string; texto: string }>
}

export const CERTIFICACIONES: Certificacion[] = [
  {
    id: 'sexualidad',
    titulo: 'Certificación en Sexualidad y Relaciones de Pareja',
    subtitulo: 'Herramientas profesionales para comprender, acompañar y transformar relaciones.',
    imagen: image('cert-sexualidad'),
    detalles: ['100% en línea, a tu ritmo', '24 horas: 8 horas intensivas por taller', 'Constancia con valor curricular avalada por Grupo Fénix'],
    objetivo: 'Una certificación para profesionales que buscan especializarse en sexualidad humana y relaciones de pareja con herramientas prácticas.',
    paraQuien: ['Psicólogos, terapeutas y profesionales de la salud que quieren especializarse en sexualidad y pareja.', 'Quienes quieren fortalecer sus habilidades para acompañar relaciones de pareja.', 'Quienes buscan comprender a profundidad la sexualidad humana, los vínculos y la dinámica relacional.'],
    incluye: ['Acceso a las clases en vivo y grabadas', 'Material de estudio descargable', 'Actividades prácticas y análisis de casos', 'Foros y acompañamiento durante la certificación', 'Constancia con valor curricular'],
    talleres: [
      { titulo: 'Sexualidad y terapia de pareja', lema: 'Reconstruyendo la conexión: intimidad, comunicación y bienestar sexual.', horas: 8 },
      { titulo: 'Relaciones modernas, límites y acuerdos de pareja', lema: 'Amar en tiempos de incertidumbre.', horas: 8 },
      { titulo: 'Infidelidad, celos y reconstrucción de la confianza', lema: 'Cuando el vínculo se rompe: caminos para sanar y reconstruir.', horas: 8 },
    ],
    testimonios: [
      { nombre: 'Mariana G.', texto: 'Los talleres me dieron herramientas prácticas y claras que pude aplicar desde el primer día en consulta.' },
      { nombre: 'Alejandro R.', texto: 'Valoro mucho poder hacer preguntas y aprender de las experiencia de los profesores. Me ayudaron a ampliar mi perspectiva y reconocer áreas en las que quiero profundizar.' },
      { nombre: 'Daniela D.', texto: 'Los temas se explicaron con claridad y pude relacionarlos con situaciones de mi práctica profesional. Me llevo herramientas y nuevas ideas para seguir aprendiendo.' },
    ],
  },
  {
    id: 'tanatologia',
    titulo: 'Certificación en Tanatología',
    subtitulo: 'Acompañando procesos de pérdida con sensibilidad, conocimiento y humanidad.',
    imagen: image('cert-tanatologia'),
    detalles: ['100% en línea, a tu ritmo', '24 horas: 8 horas por taller', 'Certificación al concluir satisfactoriamente el programa completo'],
    objetivo: 'Ofrecer herramientas teóricas y prácticas para comprender los procesos de duelo, desarrollar habilidades de intervención y promover la resiliencia, el sentido de vida y el crecimiento personal tras experiencias de pérdida.',
    paraQuien: ['Psicólogos, médicos, enfermeros, trabajadores sociales, docentes y tanatólogos.', 'Estudiantes de áreas afines y público interesado en el acompañamiento emocional.'],
    incluye: ['Acceso a las clases en vivo y grabadas', 'Material de estudio descargable', 'Actividades prácticas y análisis de casos', 'Proyecto final de certificación', 'Certificación al concluir satisfactoriamente el programa completo'],
    talleres: [
      { titulo: 'Fundamentos de la tanatología y el proceso de duelo', lema: 'Comprender la pérdida para acompañar con empatía.', horas: 8 },
      { titulo: 'Intervención tanatológica y acompañamiento en crisis', lema: 'Estar presente cuando las palabras no son suficientes.', horas: 8 },
      { titulo: 'Tanatología aplicada: resiliencia, sentido de vida y crecimiento postraumático', lema: 'Transformar el dolor en significado y crecimiento.', horas: 8 },
    ],
    testimonios: [
      { nombre: 'Laura M.', texto: 'Me quedo con la importancia de escuchar sin querer tener siempre la respuesta. Hubo temas que me hicieron revisar como acompaño a las personas cuando están pasando por una pérdida.' },
      { nombre: 'Ricardo S.', texto: 'Me gustó poder escuchar los ejemplos de los ponentes. Eso me ayudó a entender mejor algunos temas que, cuando solo los lees, pueden parecer más sencillos de lo que son.' },
      { nombre: 'Adriana T.', texto: 'Algunas sesiones me movieron mucho en lo personal. También me llevo aprendizajes para mi trabajo, sobre todo para respetar los tiempos de cada persona y no apresurar su proceso de duelo.' },
    ],
  },
]
