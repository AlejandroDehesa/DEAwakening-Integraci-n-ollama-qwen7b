import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getEventBySlug, registerForEvent } from "../services/eventsService";

const initialForm = {
  name: "",
  email: ""
};

const labels = {
  en: {
    eyebrow: "Event Detail",
    loading: "Loading event...",
    date: "Date",
    location: "Location",
    register: "Register",
    registerIntro:
      "Reserve your place and we will follow up with practical details by email.",
    name: "Name",
    email: "Email",
    submit: "Register Now",
    submitting: "Submitting...",
    success: "You are registered. We will be in touch with next steps by email.",
    nameError: "Please enter the name you would like us to use.",
    emailError: "Please add a valid email so we can confirm your place.",
    status: "Status",
    aboutTitle: "About the event",
    overviewHeading: "Overview",
    participationHeading: "Participation",
    participationCopy:
      "Complete your registration form to reserve your place and receive practical details for this gathering."
  },
  es: {
    eyebrow: "Detalle del Evento",
    loading: "Cargando evento...",
    date: "Fecha",
    location: "Ubicacion",
    register: "Inscripcion",
    registerIntro:
      "Reserva tu plaza y te escribiremos por email con los detalles practicos.",
    name: "Nombre",
    email: "Correo",
    submit: "Reservar Plaza",
    submitting: "Enviando...",
    success: "Tu plaza ha quedado registrada. Te escribiremos con los siguientes pasos.",
    nameError: "Por favor, introduce el nombre con el que quieres registrarte.",
    emailError: "Por favor, escribe un email valido para poder confirmarte la plaza.",
    status: "Estado",
    aboutTitle: "Acerca del evento",
    overviewHeading: "Resumen",
    participationHeading: "Participacion",
    participationCopy:
      "Completa tu inscripcion para reservar tu plaza y recibir por email los detalles practicos de este encuentro."
  }
};

const specialEventDetails = {
  "deawakening-valencia": {
    en: {
      title: "ResoFusion Basic - Findhorn",
      subtitle: "Findhorn, Scotland",
      intro:
        "ResoFusion: You and your body as they are meant to be. Learn to connect with your essence through gentle Resosense movements in specific frequencies. Integrate new possibilities in your body and your life with DEA group sessions. Receive the tools needed to create the change you want.",
      heroImage: "/resofusion-findhorn.jpg",
      heroImageAlt: "ResoFusion Basic in Findhorn",
      timePlaceTitle: "Time and place",
      timePlaceRange: "30 May 2025, 17:00 - 1 June 2025, 16:00",
      venue:
        "Findhorn, Findhorn Village Centre, Old School Church Place, Findhorn, Forres IV36 3YR, United Kingdom",
      mapQuery:
        "Findhorn Village Centre Old School Church Place Findhorn Forres IV36 3YR Scotland",
      guestsTitle: "Guests",
      guestsAction: "View all",
      aboutTitle: "About the event",
      aboutParagraphs: [
        "ResoFusion Basic is a 2,5 day experiential training.",
        "Learn to harness the power of resonance in your body and receive the life changing energetic work of DEA (Deep Energetic Awakening).",
        "First, you will learn how to use your own muscles to create the standing waves of resonance in your body in your fundamental frequency and three additional harmonics.",
        "Entering into resonance with your fundamental frequency initiates a process that eliminates the thought and behavior patterns, as well as the physical distortions."
      ],
      moreInfo: "<<More information>>",
      ticketsTitle: "Tickets",
      ticketTypeTitle: "Ticket type",
      ticketTypeValue: "Early registration deposit: 100 GBP",
      ticketInfoTitle: "More information",
      ticketInfoValue:
        "The early booking price is available until midnight on 31 March. Save 70 GBP. Only 350 GBP instead of 420 GBP for the full program. The remaining 250 GBP is paid in cash at the door. Tickets are non-refundable but transferable.",
      priceTitle: "Price",
      priceValue: "100.00 GBP",
      statusMessage: "Sales have ended.",
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "Ticket type",
        ticketTypeValue: "Early registration deposit: 100 GBP",
        currencyHint: "(pounds sterling)",
        moreInfoTitle: "",
        infoLines: [
          "Early booking: until midnight on 31 March.",
          "Save 70 GBP: 350 GBP instead of 420 GBP.",
          "Remaining payment at the door: 250 GBP cash.",
          "Condition: non-refundable, but transferable."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "ResoFusion Basic - Findhorn",
      subtitle: "Findhorn, Escocia",
      intro:
        "Tu y tu cuerpo tal como deben ser. Aprende a conectar con tu esencia mediante los suaves movimientos de Resosense, en frecuencias especificas. Integra las nuevas posibilidades en tu cuerpo y en tu vida con las sesiones grupales de DEA. Recibe las herramientas necesarias para crear el cambio que deseas.",
      heroImage: "/resofusion-findhorn.jpg",
      heroImageAlt: "ResoFusion Basic en Findhorn",
      timePlaceTitle: "Hora y lugar",
      timePlaceRange: "30 de mayo de 2025, 17:00 - 1 de junio de 2025, 16:00",
      venue:
        "Findhorn, Centro del pueblo de Findhorn, Old School Church Place, Findhorn, Forres IV36 3YR, Reino Unido",
      mapQuery:
        "Findhorn Village Centre Old School Church Place Findhorn Forres IV36 3YR Scotland",
      guestsTitle: "Huespedes",
      guestsAction: "Ver todo",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Resumen"
        },
        {
          type: "p",
          text: "ResoFusion Basic es una formacion practica de 2,5 dias para aprender a usar la resonancia corporal y recibir el trabajo energetico de DEA (Despertar Energetico Profundo)."
        },
        {
          type: "heading",
          text: "Que aprenderas"
        },
        {
          type: "list",
          items: [
            "Activar ondas de resonancia con tus propios musculos en tu frecuencia fundamental y tres armonicos adicionales.",
            "Usar la resonancia para liberar patrones de pensamiento, comportamiento y tension fisica.",
            "Integrar cambios reales en cuerpo, energia y vida cotidiana."
          ]
        },
        {
          type: "heading",
          text: "Como se trabaja"
        },
        {
          type: "list",
          items: [
            "5 sesiones grupales de DEA durante la formacion.",
            "Mientras una parte del grupo recibe, el resto sostiene el espacio con presencia.",
            "Este formato crea un campo energetico que facilita una transformacion mas profunda."
          ]
        },
        {
          type: "heading",
          text: "Alojamiento"
        },
        {
          type: "p",
          text: "El centro de Findhorn Village cuenta con alojamiento en hostales y hay muchos lugares encantadores donde hospedarse en la zona."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Curso basico de Resosense con manual.",
        "5 sesiones de DEA.",
        "Agua y refrigerios."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Transporte.", "Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      ticketsTitle: "Entradas",
      ticketTypeTitle: "Tipo de boleto",
      ticketTypeValue: "Deposito por inscripcion anticipada: 100 GBP",
      ticketInfoTitle: "Mas informacion",
      ticketInfoValue:
        "El precio de reserva anticipada estara disponible hasta la medianoche del 31 de marzo. Ahorra 70 GBP. Solo 350 GBP en lugar de 420 GBP por el programa completo. El resto, 250 GBP, debera abonarse en efectivo en la puerta. Las entradas no son reembolsables, pero si transferibles.",
      priceTitle: "Precio",
      priceValue: "100,00 GBP",
      statusMessage: "La venta ha finalizado.",
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue:
          "Dep\u00f3sito inscripci\u00f3n anticipada: 100 \u00a3",
        currencyHint: "(libras esterlinas)",
        moreInfoTitle: "",
        infoLines: [
          "Reserva anticipada: hasta la medianoche del 31 de marzo.",
          "Ahorro: 70 \u00a3 (350 \u00a3 en lugar de 420 \u00a3).",
          "Pago restante en puerta: 250 \u00a3 en efectivo.",
          "Condicion: no reembolsable, pero s\u00ed transferible."
        ],
        statusMessage: "La venta ha finalizado."
      }
    }
  },
  "deawakening-madrid": {
    en: {
      title: "ResoFusion Basic - Doha",
      subtitle: "Niya Honor Air, Doha",
      intro:
        "You and your body as they are meant to be. Access your essence by learning the gentle Resosense movements in specific frequencies. Integrate these new possibilities in your body and your life with DEA group sessions.",
      heroImage: "/resofusion-doha.avif",
      heroImageAlt: "ResoFusion Basic Doha",
      timePlaceRange: "27 February 2025, 16:00 - 1 March 2025, 18:00",
      venue:
        "Niya Honor Air, 194, Mercato Palazzo 1, The Pearl, Doha, Qatar",
      mapQuery:
        "Niya Honor Air 194 Mercato Palazzo 1 The Pearl Doha Qatar",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Overview"
        },
        {
          type: "p",
          text: "ResoFusion Basic is a 2.5 day practical training where you learn to create resonance standing waves in your body, in your fundamental frequency and three additional harmonics."
        },
        {
          type: "p",
          text: "Entering resonance initiates a process that helps release thought and behavior patterns, as well as physical distortions created through life experiences."
        },
        {
          type: "heading",
          text: "Group experience"
        },
        {
          type: "p",
          text: "During the training you will also receive 5 DEA group sessions. While one part of the group receives, the rest holds the space with focused presence, creating a powerful field for deep change."
        },
        {
          type: "heading",
          text: "Reservation"
        },
        {
          type: "p",
          text: "Price: 2000 QR. To reserve your place, contact NIYA TEAM directly on WhatsApp via the reservation link."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "Resosense Basic course with manual.",
        "5 DEA sessions.",
        "Water and refreshments."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Reservation price: 2000 QR",
        currencyHint: "(qatari riyals)",
        infoLines: [
          "Reserve your place with NIYA TEAM on WhatsApp.",
          "Direct link: https://wa.link/qrn627",
          "Includes Resosense Basic + 5 DEA sessions.",
          "Meals and accommodation are not included."
        ],
        statusMessage: "Booking by direct contact."
      }
    },
    es: {
      title: "ResoFusion Basic - Doha",
      subtitle: "Niya Honor Air, Doha",
      intro:
        "Tu y tu cuerpo tal como deben ser. Accede a tu esencia aprendiendo los suaves movimientos, en frecuencias especificas, de Resosense. Integra estas nuevas posibilidades en tu cuerpo y en tu vida con las sesiones grupales de DEA.",
      heroImage: "/resofusion-doha.avif",
      heroImageAlt: "ResoFusion Basic Doha",
      timePlaceRange: "27 febrero 2025, 16:00 - 01 marzo 2025, 18:00",
      venue:
        "Niya Honor Air, 194, Mercato Palazzo 1, The Pearl, Doha, Qatar",
      mapQuery:
        "Niya Honor Air 194 Mercato Palazzo 1 The Pearl Doha Qatar",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Resumen"
        },
        {
          type: "p",
          text: "ResoFusion Basic es una formacion practica de 2,5 dias para aprender a crear ondas estacionarias de resonancia en tu cuerpo, en tu frecuencia fundamental y en tres armonicos adicionales."
        },
        {
          type: "p",
          text: "Entrar en resonancia con tu frecuencia fundamental inicia un proceso que ayuda a liberar patrones de pensamiento y comportamiento, asi como distorsiones fisicas creadas en respuesta a experiencias de vida."
        },
        {
          type: "heading",
          text: "Experiencia grupal"
        },
        {
          type: "p",
          text: "Durante la formacion recibiras 5 sesiones de DEA. Mientras una parte del grupo recibe, el resto sostiene el espacio con su presencia, creando un campo energetico que facilita un cambio profundo."
        },
        {
          type: "heading",
          text: "Reserva"
        },
        {
          type: "p",
          text: "Precio: 2000 QR. Para reservar tu plaza, contacta con NIYA TEAM por WhatsApp usando el enlace de reserva."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Curso basico de Resosense con manual.",
        "5 sesiones de DEA.",
        "Agua y refrigerios."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Precio reserva: 2000 QR",
        currencyHint: "(riyales qataries)",
        infoLines: [
          "Reserva tu plaza con NIYA TEAM por WhatsApp.",
          "Enlace directo: https://wa.link/qrn627",
          "Incluye Resosense Basic + 5 sesiones DEA.",
          "Comidas y alojamiento no incluidos."
        ],
        statusMessage: "Reserva por contacto directo."
      }
    }
  },
  "deawakening-barcelona": {
    en: {
      title: "ResoFusion Basic - Doha October Edition",
      subtitle: "Niya Honor Air, Doha",
      intro:
        "You and your body as they are meant to be. Learn to access your essence through gentle Resosense movements in specific frequencies. Integrate these new possibilities in your body and your life with DEA group sessions.",
      heroImage: "/resofusion-doha-oct.avif",
      heroImageAlt: "ResoFusion Basic Doha October",
      timePlaceRange: "17 Oct 2024, 14:00 - 19 Oct 2024, 17:00",
      venue: "Niya Honor Air, Doha, Qatar",
      mapQuery: "Niya Honor Air Doha Qatar",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Overview"
        },
        {
          type: "p",
          text: "ResoFusion Basic is a 2.5 day practical training focused on resonance, body awareness and deep energetic integration."
        },
        {
          type: "heading",
          text: "What you will learn"
        },
        {
          type: "list",
          items: [
            "Create resonance standing waves in your body using your fundamental frequency and three additional harmonics.",
            "Release thought and behavior patterns linked to physical and energetic distortions.",
            "Apply a simple personal practice for stable and lasting transformation."
          ]
        },
        {
          type: "heading",
          text: "Group process"
        },
        {
          type: "p",
          text: "You will also receive 5 DEA group sessions. While one part of the group receives, the rest holds the space with focused presence, creating a powerful field for change."
        },
        {
          type: "heading",
          text: "Integration"
        },
        {
          type: "p",
          text: "If this resonates with you, this training offers a clear path to reconnect with your authentic nature and your innate healing capacity."
        }
      ],
      moreInfo: "<<Full program here>>",
      includesTitle: "Includes",
      includesItems: [
        "Resosense Basic course with manual.",
        "5 DEA sessions.",
        "Water and refreshments."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Reservation price: 2000 QR",
        currencyHint: "(qatari riyals)",
        infoLines: [
          "Reservation by direct contact with NIYA TEAM.",
          "WhatsApp: https://wa.link/qrn627",
          "Includes Resosense Basic + 5 DEA sessions.",
          "Meals and accommodation are not included."
        ],
        statusMessage: "Booking by direct contact."
      }
    },
    es: {
      title: "ResoFusion Basico - Doha Octubre",
      subtitle: "Niya Honor Air, Doha",
      intro:
        "Tu y tu cuerpo tal como deben ser. Aprende a acceder a tu esencia mediante los suaves movimientos, en frecuencias especificas, de Resosense. Integra estas nuevas posibilidades en tu cuerpo y en tu vida con las sesiones grupales de DEA.",
      heroImage: "/resofusion-doha-oct.avif",
      heroImageAlt: "ResoFusion Basico Doha Octubre",
      timePlaceRange: "17 oct 2024, 14:00 - 19 oct 2024, 17:00",
      venue: "Niya Honor Air, Doha, Qatar",
      mapQuery: "Niya Honor Air Doha Qatar",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Resumen"
        },
        {
          type: "p",
          text: "ResoFusion Basic es una formacion practica de 2,5 dias para aprender a usar la resonancia corporal y recibir el trabajo energetico transformador de DEA."
        },
        {
          type: "heading",
          text: "Que aprenderas"
        },
        {
          type: "list",
          items: [
            "Crear ondas estacionarias de resonancia en tu frecuencia fundamental y en tres armonicos adicionales.",
            "Liberar patrones de pensamiento y comportamiento vinculados a distorsiones fisicas y energeticas.",
            "Aplicar una practica personal simple, profunda y transformadora."
          ]
        },
        {
          type: "heading",
          text: "Experiencia grupal"
        },
        {
          type: "p",
          text: "Durante la formacion recibiras 5 sesiones grupales de DEA. Mientras una parte del grupo recibe, el resto sostiene el espacio con su presencia para amplificar el proceso de cambio."
        },
        {
          type: "heading",
          text: "Cierre"
        },
        {
          type: "p",
          text: "Si sientes que esto puede ayudarte, estas en lo cierto. Este proceso esta orientado a que vuelvas a tu centro de forma integra y autentica."
        }
      ],
      moreInfo: "<<Programa completo aqui>>",
      includesTitle: "Incluye",
      includesItems: [
        "Curso basico de Resosense con manual.",
        "5 sesiones de DEA.",
        "Agua y refrigerios."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Precio reserva: 2000 QR",
        currencyHint: "(riyales qataries)",
        infoLines: [
          "Reserva por contacto directo con NIYA TEAM.",
          "WhatsApp: https://wa.link/qrn627",
          "Incluye Resosense Basic + 5 sesiones DEA.",
          "Comidas y alojamiento no incluidos."
        ],
        statusMessage: "Reserva por contacto directo."
      }
    }
  },
  "deawakening-malaga": {
    en: {
      title: "ResoFusion Taster - Doha",
      subtitle: "Souq Waqif, Doha",
      intro:
        "Come, observe and experience ResoFusion for yourself. Learn to access your essence through gentle Resosense movements in specific frequencies, and integrate new possibilities through DEA group sessions.",
      heroImage: "/resofusion-tasting-doha.avif",
      heroImageAlt: "ResoFusion Taster Doha",
      timePlaceRange: "17 October 2024, 13:00 - 16:00",
      venue: "Souq Waqif, Doha, Qatar",
      mapQuery: "Souq Waqif Doha Qatar",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "ResoFusion introduction"
        },
        {
          type: "p",
          text: "3-hour initiation program to discover the power of resonance and how to use it to transform your body and your life."
        },
        {
          type: "list",
          items: [
            "2 collective DEA energetic sessions.",
            "PEAK practice to shift your state in less than one minute."
          ]
        },
        {
          type: "heading",
          text: "Next step"
        },
        {
          type: "p",
          text: "After the taster, you can continue into ResoFusion Basic, a 2.5 day experiential training with deeper resonance and integration work."
        },
        {
          type: "heading",
          text: "Price and booking"
        },
        {
          type: "p",
          text: "Price: 4000 QR. If you join the full program, you only pay the remaining 1600 QR (subject to availability)."
        }
      ],
      moreInfo: "<<Full program here>>",
      includesTitle: "Includes",
      includesItems: [
        "3-hour ResoFusion initiation program.",
        "2 collective DEA sessions.",
        "PEAK practice."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Reservation price: 4000 QR",
        currencyHint: "(qatari riyals)",
        infoLines: [
          "If you continue to the full program, remaining payment is 1600 QR.",
          "Subject to seat availability.",
          "Reservation by NIYA TEAM on WhatsApp: https://wa.link/qrn627"
        ],
        statusMessage: "Booking by direct contact."
      }
    },
    es: {
      title: "Degustacion de ResoFusion - Doha",
      subtitle: "Souq Waqif, Doha",
      intro:
        "Ven, observa y experimenta ResoFusion por ti mismo. Aprende a acceder a tu esencia mediante los suaves movimientos, en frecuencias especificas, de Resosense. Integra estas nuevas posibilidades en tu cuerpo y tu vida con las sesiones grupales de DEA.",
      heroImage: "/resofusion-tasting-doha.avif",
      heroImageAlt: "Degustacion de ResoFusion Doha",
      timePlaceRange: "17 de octubre de 2024, 13:00 - 16:00",
      venue: "Souq Waqif, Doha, Qatar",
      mapQuery: "Souq Waqif Doha Qatar",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Programa de iniciacion"
        },
        {
          type: "p",
          text: "Programa de iniciacion a ResoFusion de 3 horas para descubrir el poder de la resonancia y como usarlo para transformar tu cuerpo y tu vida."
        },
        {
          type: "list",
          items: [
            "2 sesiones del trabajo energetico colectivo de DEA.",
            "Practica PEAK para cambiar tu estado en menos de un minuto."
          ]
        },
        {
          type: "heading",
          text: "Siguiente paso"
        },
        {
          type: "p",
          text: "Despues de la degustacion, puedes continuar con ResoFusion Basic, una formacion experiencial de 2,5 dias con trabajo mas profundo de resonancia e integracion."
        },
        {
          type: "heading",
          text: "Precio y reserva"
        },
        {
          type: "p",
          text: "Precio: 4000 QR. Si decides asistir al programa completo, solo deberas abonar el saldo restante de 1600 QR (sujeto a disponibilidad de plazas)."
        }
      ],
      moreInfo: "<<Programa completo aqui>>",
      includesTitle: "Incluye",
      includesItems: [
        "Programa de iniciacion ResoFusion (3 horas).",
        "2 sesiones colectivas de DEA.",
        "Practica PEAK."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Precio reserva: 4000 QR",
        currencyHint: "(riyales qataries)",
        infoLines: [
          "Si continuas al programa completo, saldo restante: 1600 QR.",
          "Sujeto a disponibilidad de plazas.",
          "Reserva con NIYA TEAM por WhatsApp: https://wa.link/qrn627"
        ],
        statusMessage: "Reserva por contacto directo."
      }
    }
  }
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getMapEmbedUrl(location) {
  const query = encodeURIComponent(location || "Spain");
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function buildDefaultEventDetails(event, language, copy) {
  return {
    title: event.title,
    subtitle: event.location,
    intro: event.description,
    heroImage: "/resofusion-findhorn.jpg",
    heroImageAlt: event.title,
    timePlaceRange: formatDate(event.date, language),
    venue: event.location,
    aboutTitle: copy.aboutTitle,
    aboutBlocks: [
      {
        type: "heading",
        text: copy.overviewHeading
      },
      {
        type: "p",
        text: event.description
      },
      {
        type: "heading",
        text: copy.participationHeading
      },
      {
        type: "p",
        text: copy.participationCopy
      }
    ]
  };
}

function EventDetail() {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const copy = labels[currentLanguage];
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const customDetails = specialEventDetails[slug]?.[currentLanguage] ?? null;
  const eventDetails = event
    ? customDetails ?? buildDefaultEventDetails(event, currentLanguage, copy)
    : null;
  const isCustomEvent = Boolean(customDetails);
  usePageTitle(eventDetails?.title || event?.title || copy.eyebrow);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      setError("");
      setEvent(null);

      try {
        const eventData = await getEventBySlug(slug, currentLanguage);
        setEvent(eventData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [slug, currentLanguage]);

  function handleChange(eventTarget) {
    const { name, value } = eventTarget.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = copy.nameError;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = copy.emailError;
    }

    return nextErrors;
  }

  async function handleSubmit(eventTarget) {
    eventTarget.preventDefault();

    if (!event) {
      return;
    }

    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    setSubmitMessage("");
    setSubmitState("idle");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerForEvent(event.id, formData);
      setSubmitMessage(copy.success);
      setSubmitState("success");
      setFormData(initialForm);
    } catch (requestError) {
      setSubmitMessage(requestError.message);
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        {isLoading && <p className="status-message loading-message">{copy.loading}</p>}

        {error && <p className="status-message error-message">{error}</p>}

        {event && (
          <article className="detail-layout">
            <div className="detail-content">
              {eventDetails ? (
                <div className="detail-special-stack">
                  <header className="special-detail-header">
                    <h1 className="special-detail-title">{eventDetails.title}</h1>
                    <p className="special-detail-subtitle">{eventDetails.subtitle}</p>
                  </header>

                  <p className="page-copy detail-copy special-detail-intro">
                    {eventDetails.intro}
                  </p>

                  {eventDetails.heroImage ? (
                    <div className="special-detail-image-wrap">
                      <img
                        className="special-detail-image"
                        src={eventDetails.heroImage}
                        alt={eventDetails.heroImageAlt}
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  <section className="card detail-extra-card">
                    <p className="detail-label">{eventDetails.aboutTitle}</p>
                    {eventDetails.aboutBlocks?.length ? (
                      <div className="detail-about-copy">
                        {eventDetails.aboutBlocks.map((block, index) => {
                          if (block.type === "heading") {
                            return (
                              <h3 key={`${block.text}-${index}`} className="detail-about-heading">
                                {block.text}
                              </h3>
                            );
                          }

                          if (block.type === "list") {
                            return (
                              <ul key={`list-${index}`} className="detail-about-list">
                                {block.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            );
                          }

                          return <p key={`${block.text}-${index}`}>{block.text}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="detail-about-copy">
                        {eventDetails.aboutParagraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {eventDetails.moreInfo ? (
                      <p className="detail-inline-link">{eventDetails.moreInfo}</p>
                    ) : null}

                    {eventDetails.includesItems?.length &&
                    eventDetails.excludesItems?.length ? (
                      <div className="detail-include-grid">
                        <div className="detail-include-card">
                          <h3 className="detail-about-heading">
                            {eventDetails.includesTitle}
                          </h3>
                          <ul className="detail-about-list">
                            {eventDetails.includesItems.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="detail-include-card">
                          <h3 className="detail-about-heading">
                            {eventDetails.excludesTitle}
                          </h3>
                          <ul className="detail-about-list">
                            {eventDetails.excludesItems.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </section>

                  <section className="card detail-extra-card detail-map-card">
                    <p className="detail-label">{copy.location}</p>
                    <div className="detail-map-wrap">
                      <iframe
                        className="detail-map-frame"
                        src={getMapEmbedUrl(
                          eventDetails.mapQuery || eventDetails.venue || event.location
                        )}
                        title={`Map ${eventDetails.venue || event.location}`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </section>

                  {!eventDetails.hideTicketsCard && eventDetails.ticketTypeValue ? (
                    <section className="card detail-extra-card">
                      <p className="detail-label">{eventDetails.ticketsTitle}</p>
                      <p className="detail-label-soft">{eventDetails.ticketTypeTitle}</p>
                      <p>{eventDetails.ticketTypeValue}</p>
                      <p className="detail-label-soft">{eventDetails.ticketInfoTitle}</p>
                      <p>{eventDetails.ticketInfoValue}</p>
                      <p className="detail-label-soft">{eventDetails.priceTitle}</p>
                      <p>{eventDetails.priceValue}</p>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>

            <aside className="card detail-sidebar">
              {eventDetails ? (
                <>
                  <div className="detail-sidebar-meta">
                    <p className="detail-label">{copy.date}</p>
                    <p>{eventDetails.timePlaceRange}</p>
                  </div>

                  <div className="detail-sidebar-meta">
                    <p className="detail-label">{copy.location}</p>
                    <p>{eventDetails.venue}</p>
                  </div>

                  {eventDetails.sidebarTicket ? (
                    <div className="detail-sidebar-tag">
                      <p className="detail-label">{eventDetails.sidebarTicket.title}</p>
                      {eventDetails.sidebarTicket.ticketTypeTitle ? (
                        <p className="detail-label-soft">
                          {eventDetails.sidebarTicket.ticketTypeTitle}
                        </p>
                      ) : null}
                      <p className="detail-sidebar-value">
                        {eventDetails.sidebarTicket.ticketTypeValue}
                      </p>
                      {eventDetails.sidebarTicket.currencyHint ? (
                        <p className="detail-sidebar-currency-hint">
                          {eventDetails.sidebarTicket.currencyHint}
                        </p>
                      ) : null}
                      {eventDetails.sidebarTicket.infoLines?.length ? (
                        <div className="detail-sidebar-lines">
                          {eventDetails.sidebarTicket.infoLines.map((line) => (
                            <p key={line} className="detail-sidebar-line">
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="detail-sidebar-copy">
                          {eventDetails.sidebarTicket.moreInfo}
                        </p>
                      )}
                      <p className="status-message error-message sale-ended-message">
                        {eventDetails.sidebarTicket.statusMessage}
                      </p>
                    </div>
                  ) : null}

                  {!isCustomEvent ? (
                    <form className="form-card" onSubmit={handleSubmit} noValidate>
                      <div>
                        <p className="detail-label">{copy.register}</p>
                        <p className="footer-copy">{copy.registerIntro}</p>
                      </div>

                      <label className="field">
                        <span>{copy.name}</span>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={copy.name}
                        />
                        {formErrors.name && (
                          <small className="field-error">{formErrors.name}</small>
                        )}
                      </label>

                      <label className="field">
                        <span>{copy.email}</span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                        />
                        {formErrors.email && (
                          <small className="field-error">{formErrors.email}</small>
                        )}
                      </label>

                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? copy.submitting : copy.submit}
                      </button>

                      {submitMessage && (
                        <p
                          className={
                            submitState === "error"
                              ? "status-message error-message"
                              : "status-message"
                          }
                        >
                          {submitMessage}
                        </p>
                      )}
                    </form>
                  ) : null}
                </>
              ) : null}
            </aside>
          </article>
        )}
      </div>
    </section>
  );
}

export default EventDetail;
