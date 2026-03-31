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
  },
  de: {
    eyebrow: "Veranstaltungsdetails",
    loading: "Event wird geladen...",
    date: "Datum",
    location: "Ort",
    register: "Anmeldung",
    registerIntro:
      "Reserviere deinen Platz und wir schicken dir die praktischen Details per E-Mail.",
    name: "Name",
    email: "E-Mail",
    submit: "Jetzt Anmelden",
    submitting: "Wird gesendet...",
    success:
      "Dein Platz wurde registriert. Wir melden uns per E-Mail mit den nächsten Schritten.",
    nameError: "Bitte gib den Namen ein, mit dem du dich registrieren möchtest.",
    emailError: "Bitte gib eine gültige E-Mail ein, damit wir deinen Platz bestätigen können.",
    status: "Status",
    aboutTitle: "Über das Event",
    overviewHeading: "Überblick",
    participationHeading: "Teilnahme",
    participationCopy:
      "Fülle das Formular aus, um deinen Platz zu reservieren und alle praktischen Details zu erhalten."
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
      subtitle: "Niya Honor Air, Doha",
      intro:
        "Come, observe and experience ResoFusion for yourself. Learn to access your essence through gentle Resosense movements in specific frequencies, and integrate new possibilities through DEA group sessions.",
      heroImage: "/resofusion-tasting-doha.avif",
      heroImageAlt: "ResoFusion Taster Doha",
      timePlaceRange: "17 October 2024, 13:00 - 16:00",
      venue: "Niya Honor Air, Doha, Qatar",
      mapQuery: "Niya Honor Air Doha Qatar",
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
      subtitle: "Niya Honor Air, Doha",
      intro:
        "Ven, observa y experimenta ResoFusion por ti mismo. Aprende a acceder a tu esencia mediante los suaves movimientos, en frecuencias especificas, de Resosense. Integra estas nuevas posibilidades en tu cuerpo y tu vida con las sesiones grupales de DEA.",
      heroImage: "/resofusion-tasting-doha.avif",
      heroImageAlt: "Degustacion de ResoFusion Doha",
      timePlaceRange: "17 de octubre de 2024, 13:00 - 16:00",
      venue: "Niya Honor Air, Doha, Qatar",
      mapQuery: "Niya Honor Air Doha Qatar",
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
  },
  "deawakening-sevilla": {
    en: {
      title: "ResoFusion Basic",
      subtitle: "Srithanu, Koh Phangan, Thailand",
      intro:
        "You and your body as they are meant to be. Learn to access your essence through gentle Resosense movements in specific frequencies. Integrate these new possibilities in your body and your life with DEA group sessions.",
      heroImage: "/resofusion-orion.avif",
      heroImageAlt: "ResoFusion Basic Orion Healing",
      timePlaceRange: "06 Sep 2024, 13:30 - 08 Sep 2024, 17:00",
      venue: "Srithanu, Koh Phangan, Thailand",
      mapQuery: "Srithanu Koh Phangan Thailand",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Overview"
        },
        {
          type: "p",
          text: "ResoFusion Basic is a 2.5 day practical training designed to help you harness resonance for deep body and life transformation."
        },
        {
          type: "heading",
          text: "What you will learn"
        },
        {
          type: "list",
          items: [
            "Create resonance standing waves in your body with your fundamental frequency and three additional harmonics.",
            "Release thought and behavior patterns linked to physical distortions.",
            "Apply a simple and powerful daily personal practice."
          ]
        },
        {
          type: "heading",
          text: "Group DEA experience"
        },
        {
          type: "p",
          text: "You will receive 5 DEA group sessions. While part of the group receives, the rest holds the space with presence, creating a powerful collective field for change."
        },
        {
          type: "heading",
          text: "Price and booking"
        },
        {
          type: "p",
          text: "Price: 15,000 THB. Reserve with a 3,000 THB deposit via the booking link or directly at Orion. Remaining balance is paid in cash at the door. Deposit is transferable but non-refundable."
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
        ticketTypeValue: "Price: 15,000 THB",
        currencyHint: "(thai baht)",
        infoLines: [
          "Reserve with a 3,000 THB deposit.",
          "Remaining balance is paid in cash at the door.",
          "Deposit is transferable, non-refundable."
        ],
        statusMessage: "Booking has ended."
      }
    },
    es: {
      title: "ResoFusion Basico",
      subtitle: "Srithanu, Koh Phangan, Tailandia",
      intro:
        "Tu y tu cuerpo tal como deben ser. Aprende a acceder a tu esencia mediante los suaves movimientos, en frecuencias especificas, de Resosense. Integra estas nuevas posibilidades en tu cuerpo y en tu vida con las sesiones grupales de DEA.",
      heroImage: "/resofusion-orion.avif",
      heroImageAlt: "ResoFusion Basico Orion Healing",
      timePlaceRange: "06 sept 2024, 13:30 - 08 sept 2024, 17:00",
      venue: "Srithanu, Koh Phangan, Tailandia",
      mapQuery: "Srithanu Koh Phangan Thailand",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Resumen"
        },
        {
          type: "p",
          text: "ResoFusion Basic es una formacion practica de 2,5 dias para aprender a usar la resonancia en tu cuerpo y recibir el trabajo energetico transformador de DEA."
        },
        {
          type: "heading",
          text: "Que aprenderas"
        },
        {
          type: "list",
          items: [
            "Crear ondas estacionarias de resonancia en tu frecuencia fundamental y tres armonicos adicionales.",
            "Liberar patrones de pensamiento y comportamiento vinculados a distorsiones fisicas.",
            "Aplicar una practica personal simple, potente y transformadora."
          ]
        },
        {
          type: "heading",
          text: "Experiencia grupal DEA"
        },
        {
          type: "p",
          text: "Durante la formacion recibiras 5 sesiones grupales de DEA. Mientras una parte del grupo recibe, el resto sostiene el espacio con su presencia para potenciar el proceso."
        },
        {
          type: "heading",
          text: "Precio y reserva"
        },
        {
          type: "p",
          text: "Precio: 15.000 THB. Reserva con deposito de 3000 THB desde el enlace o directamente en Orion. El saldo restante se paga en efectivo en la puerta. El deposito es transferible, pero no reembolsable."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Curso basico de Reosense con manual.",
        "5 sesiones de DEA.",
        "Agua y refrigerios."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Precio: 15.000 THB",
        currencyHint: "(baht tailandes)",
        infoLines: [
          "Reserva con deposito de 3000 THB.",
          "Saldo restante en efectivo en la puerta.",
          "Deposito transferible, no reembolsable."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-bilbao": {
    en: {
      title: "ResoFusion Taster",
      subtitle: "Orion Healing, Koh Phangan",
      intro:
        "ResoFusion: You and your body as they should be. Learn how Resosense uses gentle movements in specific frequencies to enter resonance with your true essence, and receive powerful DEA group sessions to support change.",
      heroImage: "/resofusion-taster-orion.avif",
      heroImageAlt: "ResoFusion Taster Orion Healing",
      timePlaceRange: "05 Sep 2024, 13:30 - 17:30",
      venue: "Orion Healing, Srithanu, Koh Pha Ngan, Thailand",
      mapQuery: "Orion Healing Srithanu Koh Pha Ngan Thailand",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Introduction"
        },
        {
          type: "p",
          text: "In this ResoFusion introduction we will show how resonance is created through standing waves and how you can use this practical method to align with your fundamental frequency."
        },
        {
          type: "p",
          text: "You will receive two DEA group sessions. While one part of the group receives, the rest holds the space, creating a strong collective energetic field for deep insight and change."
        },
        {
          type: "heading",
          text: "Connection to the full program"
        },
        {
          type: "p",
          text: "This event introduces the full 2.5 day program (Fri 6 to Sun 8). If you continue to the full program, you receive a 2000 THB discount, subject to seat availability."
        },
        {
          type: "heading",
          text: "Price and contact"
        },
        {
          type: "p",
          text: "Cost: 2000 THB. You can confirm attendance here and pay cash at the door, or prepay at Orion. WhatsApp: +34 670 321 400 | Email: info@resosense.com"
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "ResoFusion introduction session.",
        "2 DEA group sessions.",
        "Guided PEAK practice."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Cost: 2000 THB",
        currencyHint: "(thai baht)",
        infoLines: [
          "Limited to 15 participants.",
          "You may pay cash at the door.",
          "Contact: +34 670 321 400 | info@resosense.com"
        ],
        statusMessage: "Limited spots: 15 participants."
      }
    },
    es: {
      title: "Degustador de ResoFusion",
      subtitle: "Sanacion de Orion",
      intro:
        "ResoFusion - Tu y tu cuerpo como deberian ser. Aprende como la practica de Resosense utiliza movimientos suaves en frecuencias especificas para entrar en resonancia con tu verdadera esencia. Recibe las sesiones energeticas grupales de DEA para crear la consciencia que necesitas para cambiar.",
      heroImage: "/resofusion-taster-orion.avif",
      heroImageAlt: "Degustador de ResoFusion Orion Healing",
      timePlaceRange: "05 de septiembre de 2024, 13:30 - 17:30",
      venue: "Orion Healing, Srithanu, Koh Pha Ngan, Tailandia",
      mapQuery: "Orion Healing Srithanu Koh Pha Ngan Thailand",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Introduccion"
        },
        {
          type: "p",
          text: "En esta introduccion a ResoFusion te mostraremos como se crea el poder de la resonancia mediante ondas estacionarias y como usarlo para entrar en sintonia con tu frecuencia fundamental."
        },
        {
          type: "p",
          text: "Recibiras dos sesiones del programa grupal DEA. Mientras una parte del grupo recibe, el resto mantiene el espacio, creando un campo energetico colectivo para nuevas perspectivas y cambio profundo."
        },
        {
          type: "heading",
          text: "Conexion con el programa completo"
        },
        {
          type: "p",
          text: "Este evento es una introduccion al programa completo de 2,5 dias (del viernes 6 al domingo 8). Si continuas al programa completo, obtienes un descuento de 2000 THB, sujeto a disponibilidad."
        },
        {
          type: "heading",
          text: "Precio y contacto"
        },
        {
          type: "p",
          text: "Coste: 2000 THB. Puedes confirmar aqui y pagar en efectivo en la puerta, o pagar por adelantado en Orion. WhatsApp: +34 670 321 400 | Correo: info@resosense.com"
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Sesion introductoria de ResoFusion.",
        "2 sesiones grupales de DEA.",
        "Practica guiada PEAK."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Coste: 2000 THB",
        currencyHint: "(baht tailandes)",
        infoLines: [
          "Plazas limitadas a 15 participantes.",
          "Pago en efectivo en la puerta disponible.",
          "Contacto: +34 670 321 400 | info@resosense.com"
        ],
        statusMessage: "Plazas limitadas: 15 participantes."
      }
    }
  },
  "deawakening-zaragoza": {
    en: {
      title: "ResoFusion Basic in Mallorca",
      subtitle: "Palma",
      intro:
        "Do you want to learn something you can use to change your body and your life?",
      heroImage: "/resofusion-mallorca.avif",
      heroImageAlt: "ResoFusion Basic in Mallorca",
      timePlaceRange: "29 Jun 2024, 10:00 - 30 Jun 2024, 17:00",
      venue:
        "Carrer de Marti Boneo, 31, Ponent, 07013 Palma, Illes Balears, Spain",
      mapQuery:
        "Carrer de Marti Boneo 31 Ponent 07013 Palma Illes Balears Spain",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "p",
          text: "ResoFusion Basic combines learning the powerful personal Resosense practice with receiving Deep Energetic Awakening (DEA) group sessions."
        },
        {
          type: "p",
          text: "Resosense is based on the physics of resonance and uses gentle movements in specific frequencies to restore your body and life to their original healthy state."
        },
        {
          type: "p",
          text: "DEA helps you access your physical and energetic resources for healing and integrate Resosense into your healthy lifestyle."
        },
        {
          type: "p",
          text: "The weekend results are deeply transformational. Price: 360 EUR."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "Resosense Basic training.",
        "DEA group sessions.",
        "Integration guidance."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Price: 360 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Weekend immersive format.",
          "Limited availability.",
          "Contact the organiser to reserve your place."
        ],
        statusMessage: "Reservation by direct contact."
      }
    },
    es: {
      title: "ResoFusion Basic en Mallorca",
      subtitle: "Palma",
      intro:
        "Quieres aprender algo que puedas usar para cambiar tu cuerpo y tu vida?",
      heroImage: "/resofusion-mallorca.avif",
      heroImageAlt: "ResoFusion Basic en Mallorca",
      timePlaceRange: "29 de junio de 2024, 10:00 - 30 de junio de 2024, 17:00",
      venue:
        "Carrer de Marti Boneo, 31, Ponent, 07013 Palma, Illes Balears, Espana",
      mapQuery:
        "Carrer de Marti Boneo 31 Ponent 07013 Palma Illes Balears Spain",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "p",
          text: "ResoFusion Basic combina el aprendizaje de la practica personal de Resosense con la recepcion de sesiones grupales de Despertar Energetico Profundo (DEA)."
        },
        {
          type: "p",
          text: "Resosense, basado en la fisica de la resonancia, es una practica diaria facil de aprender que utiliza movimientos suaves en frecuencias especificas para restaurar tu bienestar y el de tu cuerpo."
        },
        {
          type: "p",
          text: "DEA te ayuda a acceder mejor a tus recursos fisicos y energeticos para la sanacion e integrar Resosense en tu estilo de vida saludable."
        },
        {
          type: "p",
          text: "Los resultados de este programa de fin de semana son transformadores. Precio: 360 EUR."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Formacion ResoFusion Basic.",
        "Sesiones grupales DEA.",
        "Guia de integracion."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Precio: 360 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Formato inmersivo de fin de semana.",
          "Plazas limitadas.",
          "Reserva por contacto directo con la organizacion."
        ],
        statusMessage: "Reserva por contacto directo."
      }
    }
  },
  "deawakening-alicante": {
    en: {
      title: "DEA at Casa Wald",
      subtitle: "Illes Balears",
      intro:
        "Open Fire Cookout with Finding the Others. A live DEA gathering focused on energetic reset, conscious connection and embodied presence.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg",
      heroImageAlt: "DEA at Casa Wald",
      timePlaceRange: "02 Jun 2024",
      venue: "Illes Balears, Spain",
      mapQuery: "Illes Balears Spain",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Open fire format"
        },
        {
          type: "p",
          text: "An intimate DEA encounter combined with conscious community and shared open-fire gathering."
        },
        {
          type: "p",
          text: "This format supports energetic opening, emotional clarity and deeper relational presence."
        },
        {
          type: "heading",
          text: "Experience focus"
        },
        {
          type: "p",
          text: "The event was presented as a live community container where presence, body awareness and human connection are cultivated together."
        },
        {
          type: "heading",
          text: "How it works"
        },
        {
          type: "p",
          text: "Part of the group receives direct DEA support while the rest holds the space with focused attention, creating a stronger collective field."
        },
        {
          type: "p",
          text: "The intention is practical integration: leave with more grounded awareness, emotional space and inner direction."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "DEA group energetic session.",
        "Guided shared field process.",
        "Community integration space."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Transport.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Check external booking link",
        currencyHint: "",
        infoLines: [
          "This event is managed via external ticketing.",
          "Follow the official link for current availability."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "DEA en Casa Wald",
      subtitle: "Illes Balears",
      intro:
        "Open Fire Cookout con Finding the Others. Un encuentro DEA centrado en presencia, conexion humana y reajuste energetico.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg",
      heroImageAlt: "DEA en Casa Wald",
      timePlaceRange: "02 jun 2024",
      venue: "Illes Balears, Espana",
      mapQuery: "Illes Balears Spain",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Formato open fire"
        },
        {
          type: "p",
          text: "Un formato intimo que combina trabajo energetico DEA con comunidad consciente y espacio de integracion."
        },
        {
          type: "p",
          text: "Disenado para facilitar apertura energetica, claridad emocional y una presencia mas profunda."
        },
        {
          type: "heading",
          text: "Enfoque de la experiencia"
        },
        {
          type: "p",
          text: "El encuentro se presentaba como un contenedor vivo de comunidad, presencia y trabajo corporal para integrar cambios reales."
        },
        {
          type: "heading",
          text: "Como funciona"
        },
        {
          type: "p",
          text: "Una parte del grupo recibe trabajo directo DEA mientras el resto sostiene el espacio con atencion enfocada para amplificar el campo colectivo."
        },
        {
          type: "p",
          text: "El objetivo es integracion real: salir con mas presencia, claridad emocional y direccion interna."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Sesion grupal DEA.",
        "Proceso guiado de campo compartido.",
        "Espacio de integracion comunitaria."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Transporte.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Consulta enlace externo de reservas",
        currencyHint: "",
        infoLines: [
          "Evento gestionado con ticketera externa.",
          "Revisa el enlace oficial para disponibilidad actual."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-granada": {
    en: {
      title: "DEA at Orion Healing Center, Koh Pha Ngan",
      subtitle: "Orion Healing Centre",
      intro:
        "Two evening DEA group healing sessions in Koh Pha Ngan, working through Discover, Transform and Awaken in a held energetic field.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp/v1/fill/w_960,h_660,al_c,q_85,enc_auto/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp",
      heroImageAlt: "DEA at Orion Healing Center",
      timePlaceRange: "28 Jan 2024, 18:30 - 30 Jan 2024, 21:30",
      venue:
        "Orion Healing Centre, 15/2 Moo 8, Srithanu, Koh Pha Ngan, Surat Thani 84280, Thailand",
      mapQuery: "Orion Healing Centre 15/2 Moo 8 Srithanu Koh Pha Ngan Thailand",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Session format"
        },
        {
          type: "p",
          text: "David facilitates two group healing sessions: Sunday 28 and Monday 29 January, both starting at 18:30."
        },
        {
          type: "p",
          text: "Each evening is divided in two parts so participants can stay with the first block or continue into the deeper Awaken block."
        },
        {
          type: "heading",
          text: "Discover, Transform, Awaken"
        },
        {
          type: "p",
          text: "The work moves through the life cycles of Discover, Transform and Awaken, helping release deeply held physical, emotional and behavioral patterns."
        },
        {
          type: "heading",
          text: "Pricing from original listing"
        },
        {
          type: "p",
          text: "Discover/Transform session (18:30-20:15): 2000 THB. Optional Awaken continuation (20:30-21:30): 1500 THB."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "Two guided DEA group sessions.",
        "Discover/Transform life-cycle process.",
        "Optional Awaken deepening block."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Discover/Transform: 2000 THB",
        currencyHint: "",
        infoLines: [
          "Optional Awaken continuation: 1500 THB.",
          "Original listing marked as ended."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "DEA en Orion Healing Center, Koh Pha Ngan",
      subtitle: "Orion Healing Centre",
      intro:
        "Dos sesiones grupales DEA en Koh Pha Ngan para trabajar los ciclos de Descubrir, Transformar y Despertar en un campo energetico sostenido.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp/v1/fill/w_960,h_660,al_c,q_85,enc_auto/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp",
      heroImageAlt: "DEA en Orion Healing Center",
      timePlaceRange: "28 ene 2024, 18:30 - 30 ene 2024, 21:30",
      venue:
        "Orion Healing Centre, 15/2 Moo 8, Srithanu, Koh Pha Ngan, Surat Thani 84280, Tailandia",
      mapQuery: "Orion Healing Centre 15/2 Moo 8 Srithanu Koh Pha Ngan Thailand",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Formato de sesiones"
        },
        {
          type: "p",
          text: "David facilita dos sesiones grupales: domingo 28 y lunes 29 de enero, ambas a las 18:30."
        },
        {
          type: "p",
          text: "Cada sesion se divide en dos bloques para que puedas quedarte en el primer tramo o continuar al bloque Awaken."
        },
        {
          type: "heading",
          text: "Descubrir, Transformar, Despertar"
        },
        {
          type: "p",
          text: "El trabajo recorre los ciclos de vida Discover, Transform y Awaken, favoreciendo liberacion de patrones fisicos, emocionales y de comportamiento."
        },
        {
          type: "heading",
          text: "Inversion segun listado original"
        },
        {
          type: "p",
          text: "Sesion Discover/Transform (18:30-20:15): 2000 THB. Continuacion Awaken opcional (20:30-21:30): 1500 THB."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Dos sesiones DEA guiadas.",
        "Proceso de ciclo Discover/Transform.",
        "Bloque Awaken opcional para profundizar."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Discover/Transform: 2000 THB",
        currencyHint: "",
        infoLines: [
          "Continuacion Awaken opcional: 1500 THB.",
          "El listado original aparece finalizado."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-palma": {
    en: {
      title: "DEA at the Sactuary",
      subtitle: "Tambon Ban Tai",
      intro:
        "A multi-day DEA offering in The Sanctuary for guests and visitors, focused on deep energetic reset and embodied transformation.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg/v1/fill/w_980,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg",
      heroImageAlt: "DEA at the Sactuary",
      timePlaceRange: "10 Jan 2024, 09:00 - 30 Jan 2024, 18:00",
      venue:
        "Tambon Ban Tai, 153/14 Moo 6, Koh Pha Ngan, Surat Thani 84280, Thailand",
      mapQuery: "Tambon Ban Tai 153/14 Moo 6 Koh Pha Ngan Surat Thani Thailand",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Group DEA sessions"
        },
        {
          type: "p",
          text: "Sessions are offered to guests and visitors in groups of 6-12 people."
        },
        {
          type: "p",
          text: "Each process works through three rounds aligned with Discover, Transform and Awaken."
        },
        {
          type: "heading",
          text: "Setting and intention"
        },
        {
          type: "p",
          text: "The venue is surrounded by jungle and granite boulders, creating a strong container for detox support, change and integration."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "DEA group sessions (6-12 participants).",
        "Three-round energetic process.",
        "Shared field support for deeper integration."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Info / Waiting list",
        currencyHint: "",
        infoLines: [
          "Original page references direct coordination with venue.",
          "Official listing currently marked as ended."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "DEA at the Sactuary",
      subtitle: "Tambon Ban Tai",
      intro:
        "Programa DEA de varios dias en The Sanctuary para huespedes y visitantes, orientado a reajuste energetico e integracion profunda.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg/v1/fill/w_980,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg",
      heroImageAlt: "DEA at the Sactuary",
      timePlaceRange: "10 ene 2024, 09:00 - 30 ene 2024, 18:00",
      venue:
        "Tambon Ban Tai, 153/14 Moo 6, Koh Pha Ngan, Surat Thani 84280, Tailandia",
      mapQuery: "Tambon Ban Tai 153/14 Moo 6 Koh Pha Ngan Surat Thani Thailand",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Sesiones DEA grupales"
        },
        {
          type: "p",
          text: "Las sesiones se ofrecen a huespedes y visitantes en grupos reducidos de 6 a 12 personas."
        },
        {
          type: "p",
          text: "Cada proceso trabaja en tres rondas conectadas con Discover, Transform y Awaken."
        },
        {
          type: "heading",
          text: "Entorno e intencion"
        },
        {
          type: "p",
          text: "El espacio, rodeado de selva y rocas de granito, amplifica el trabajo de detox, cambio y aterrizaje en la vida real."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Sesiones DEA grupales (6-12 personas).",
        "Proceso energetico en tres rondas.",
        "Sosten de campo compartido para integrar."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comidas.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Info / Lista de espera",
        currencyHint: "",
        infoLines: [
          "El listado original indica coordinacion directa con el centro.",
          "La publicacion oficial figura finalizada."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-san-sebastian": {
    en: {
      title: "DEAwakening One Day Intensive",
      subtitle: "Sesimbra",
      intro:
        "A one-day DEA intensive designed to help release limiting patterns and integrate practical tools in a focused villa setting.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg",
      heroImageAlt: "DEAwakening One Day Intensive",
      timePlaceRange: "25 Jun 2023, 19:00 - 23:00",
      venue: "Sesimbra, Avenida Joao Paolo, Portugal",
      mapQuery: "Avenida Joao Paolo Sesimbra Portugal",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "One-day intensive"
        },
        {
          type: "p",
          text: "Deep Energetic Awakening (DEA) is used here as a practical pathway to release thought, behavior and physical patterns that limit expression and enjoyment of life."
        },
        {
          type: "p",
          text: "The day includes three group sessions, supported by breathwork and additional modalities when needed."
        },
        {
          type: "heading",
          text: "Practical details"
        },
        {
          type: "p",
          text: "Snacks are included. Participants were asked to bring their own lunch, plus swimsuit and towel for pool access."
        },
        {
          type: "p",
          text: "Original listing price: 150 EUR for the full day."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "Three DEA group sessions.",
        "Breathwork-supported process.",
        "Snacks during the program."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Main meals.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Deposit: 50 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Full price in listing: 150 EUR.",
          "Balance paid in cash on arrival."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "DEAwakening One Day Intensive",
      subtitle: "Sesimbra",
      intro:
        "Intensivo DEA de un dia para soltar patrones limitantes e integrar herramientas practicas en un entorno de villa.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg",
      heroImageAlt: "DEAwakening One Day Intensive",
      timePlaceRange: "25 jun 2023, 19:00 - 23:00",
      venue: "Sesimbra, Avenida Joao Paolo, Portugal",
      mapQuery: "Avenida Joao Paolo Sesimbra Portugal",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Intensivo de un dia"
        },
        {
          type: "p",
          text: "Deep Energetic Awakening (DEA) se aplica como via practica para liberar patrones de pensamiento, comportamiento y cuerpo que limitan tu expresion."
        },
        {
          type: "p",
          text: "La jornada incluye tres sesiones grupales, apoyadas por breathwork y otras modalidades segun necesidad."
        },
        {
          type: "heading",
          text: "Detalles practicos"
        },
        {
          type: "p",
          text: "Se ofrecian snacks durante el programa. Se recomendaba traer comida propia, banador y toalla para la piscina."
        },
        {
          type: "p",
          text: "Precio publicado en el listado original: 150 EUR por la jornada completa."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Tres sesiones grupales DEA.",
        "Proceso con apoyo de breathwork.",
        "Snacks durante el programa."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Comida principal.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Deposito: 50 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Precio total publicado: 150 EUR.",
          "El saldo se abonaba en efectivo al llegar."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-murcia": {
    en: {
      title: "ResoFusion Retreat Portugal",
      subtitle: "Casa Na Ferraria",
      intro:
        "A 4-day retreat that combines transformative DEA group sessions with practical Resosense learning in a nurturing natural setting.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg/v1/fill/w_980,h_1471,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg",
      heroImageAlt: "ResoFusion Retreat Portugal",
      timePlaceRange: "19 Jun 2023, 17:00 - 23 Jun 2023, 11:00",
      venue: "Casa Na Ferraria, Herdade da Ferraria, 2970-246, Portugal",
      mapQuery: "Casa Na Ferraria Herdade da Ferraria 2970-246 Portugal",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Retreat concept"
        },
        {
          type: "p",
          text: "The retreat combines DEA energetic sessions and Resosense personal practice training across four days."
        },
        {
          type: "p",
          text: "The original description emphasizes learning, embodied experience and awakening in a supportive environment with quality food."
        },
        {
          type: "heading",
          text: "Booking notes from original listing"
        },
        {
          type: "p",
          text: "Shared-room deposit listed at 400 EUR, with early-bird savings of 100 EUR if paid by 31/05/23. Remaining balance was due by 08/06/23."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "4-day ResoFusion retreat program.",
        "DEA group energetic sessions.",
        "Resosense practical training."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Travel.", "Personal expenses."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Deposit from listing: 400 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Early-bird saving: 100 EUR (before 31/05/23).",
          "Balance was due by 08/06/23."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "ResoFusion Retreat Portugal",
      subtitle: "Casa Na Ferraria",
      intro:
        "Retiro de 4 dias que combina sesiones energeticas DEA con aprendizaje practico de Resosense en un entorno natural cuidado.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg/v1/fill/w_980,h_1471,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg",
      heroImageAlt: "ResoFusion Retreat Portugal",
      timePlaceRange: "19 jun 2023, 17:00 - 23 jun 2023, 11:00",
      venue: "Casa Na Ferraria, Herdade da Ferraria, 2970-246, Portugal",
      mapQuery: "Casa Na Ferraria Herdade da Ferraria 2970-246 Portugal",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Concepto del retiro"
        },
        {
          type: "p",
          text: "El retiro une sesiones energeticas DEA con formacion en la practica personal de Resosense durante cuatro dias."
        },
        {
          type: "p",
          text: "La descripcion original pone foco en aprender, experimentar e integrar en un entorno de presencia y cuidado."
        },
        {
          type: "heading",
          text: "Reserva segun listado original"
        },
        {
          type: "p",
          text: "Deposito en habitacion compartida: 400 EUR. Ahorro early bird de 100 EUR si se abonaba antes del 31/05/23. El saldo debia pagarse antes del 08/06/23."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Programa ResoFusion de 4 dias.",
        "Sesiones energeticas DEA en grupo.",
        "Practica guiada de Resosense."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Transporte.", "Gastos personales."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Deposito publicado: 400 EUR",
        currencyHint: "(euros)",
        infoLines: [
          "Ahorro early bird: 100 EUR (antes del 31/05/23).",
          "El saldo debia abonarse antes del 08/06/23."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-santiago-compostela": {
    en: {
      title: "Harvest Series 7 - Kaplankaya, Turkey",
      subtitle: "Six Senses Kaplankaya",
      intro:
        "A premium Harvest Series gathering where David was invited to deliver multiple daily DEA sessions in an international retreat setting.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg/v1/fill/w_980,h_551,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg",
      heroImageAlt: "Harvest Series 7 Kaplankaya",
      timePlaceRange: "10 May 2023, 19:00 - 14 May 2023, 19:00",
      venue: "Six Senses Kaplankaya, Bozbuk, Milas/Mugla, Turkiye",
      mapQuery: "Six Senses Kaplankaya Bozbuk Milas Mugla Turkiye",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "Program context"
        },
        {
          type: "p",
          text: "David returned to this international gathering to serve participants across several days of workshops and talks."
        },
        {
          type: "p",
          text: "The original listing highlights high-level speakers, immersive workshops and strong community connection."
        },
        {
          type: "heading",
          text: "DEA delivery"
        },
        {
          type: "p",
          text: "Two DEA group sessions per day were offered for groups of up to 24, with additional private sessions before and after the program."
        },
        {
          type: "p",
          text: "Group DEA sessions were included in the main Harvest package."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "Two DEA group sessions per day.",
        "Access to main Harvest workshops and speakers.",
        "Retreat setting and curated shared experience."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Travel.", "Accommodation package differences."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Included in Harvest package",
        currencyHint: "",
        infoLines: [
          "Private sessions were offered separately.",
          "Original listing currently marked as ended."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "Harvest Series 7 - Kaplankaya, Turquia",
      subtitle: "Six Senses Kaplankaya",
      intro:
        "Encuentro premium de la serie Harvest donde David fue invitado para facilitar multiples sesiones DEA en un entorno internacional de retiro.",
      heroImage:
        "https://static.wixstatic.com/media/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg/v1/fill/w_980,h_551,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg",
      heroImageAlt: "Harvest Series 7 Kaplankaya",
      timePlaceRange: "10 may 2023, 19:00 - 14 may 2023, 19:00",
      venue: "Six Senses Kaplankaya, Bozbuk, Milas/Mugla, Turquia",
      mapQuery: "Six Senses Kaplankaya Bozbuk Milas Mugla Turkiye",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Contexto del programa"
        },
        {
          type: "p",
          text: "David regreso a este encuentro internacional para acompanar a participantes durante varios dias de talleres y actividades."
        },
        {
          type: "p",
          text: "El listado original destaca ponentes de alto nivel, workshops inmersivos y un ambiente de comunidad consciente."
        },
        {
          type: "heading",
          text: "Formato DEA"
        },
        {
          type: "p",
          text: "Se ofrecian dos sesiones DEA grupales al dia para grupos de hasta 24 personas, ademas de sesiones privadas antes y despues del programa."
        },
        {
          type: "p",
          text: "Las sesiones grupales DEA estaban incluidas dentro del paquete general de Harvest."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Dos sesiones DEA grupales por dia.",
        "Acceso a talleres y ponentes de Harvest.",
        "Entorno de retiro curado."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Transporte.", "Diferencias de paquete de alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Incluido en paquete Harvest",
        currencyHint: "",
        infoLines: [
          "Las sesiones privadas se ofrecian por separado.",
          "El listado original aparece finalizado."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  },
  "deawakening-las-palmas": {
    en: {
      title: "ResoFusion",
      subtitle: "Niagara Wellness",
      intro:
        "A two-day ResoFusion program that combines Resosense personal practice with DEA energetic sessions to create deep and practical change.",
      heroImage:
        "https://static.wixstatic.com/media/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg/v1/fill/w_980,h_1431,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg",
      heroImageAlt: "ResoFusion Niagara Wellness",
      timePlaceRange: "06 May 2023, 9:30 - 07 May 2023, 18:00",
      venue:
        "Niagara Wellness, Akat, Acelya Sk No:43, 34335 Besiktas/Istanbul, Turkiye",
      mapQuery: "Niagara Wellness Akat Acelya Sk No 43 Besiktas Istanbul Turkiye",
      aboutTitle: "About the event",
      aboutBlocks: [
        {
          type: "heading",
          text: "The basics"
        },
        {
          type: "p",
          text: "The event combines transformative DEA sessions with practical training in Resosense for daily self-regulation."
        },
        {
          type: "heading",
          text: "Learn Resosense"
        },
        {
          type: "p",
          text: "Resosense is based on resonance physics and uses specific gentle movements that can be practiced in a few minutes per day."
        },
        {
          type: "list",
          items: [
            "Physical: supports mobility and body organization.",
            "Emotional: helps release deep stress patterns.",
            "Mental: supports calm focus and clarity.",
            "Energetic: supports chakra and energy-field balance."
          ]
        },
        {
          type: "heading",
          text: "Receive DEA"
        },
        {
          type: "p",
          text: "While part of the group receives on tables, the rest holds focused presence, amplifying the process and opening space for meaningful change."
        },
        {
          type: "p",
          text: "Original listing reference: two-day event 500 USD. Private sessions with David (50 min): 200 USD."
        }
      ],
      includesTitle: "Includes",
      includesItems: [
        "ResoFusion 2-day program.",
        "DEA group energetic sessions.",
        "Resosense practice guidance and integration."
      ],
      excludesTitle: "Does not include",
      excludesItems: ["Travel.", "Accommodation."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Tickets",
        ticketTypeTitle: "",
        ticketTypeValue: "Two-day event: 500 USD",
        currencyHint: "(us dollars)",
        infoLines: [
          "Private sessions with David (50 min): 200 USD.",
          "Original listing currently marked as ended."
        ],
        statusMessage: "Sales have ended."
      }
    },
    es: {
      title: "ResoFusion",
      subtitle: "Niagara Wellness",
      intro:
        "Programa ResoFusion de 2 dias que integra practica personal de Resosense con sesiones energeticas DEA para generar cambios profundos y aplicables.",
      heroImage:
        "https://static.wixstatic.com/media/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg/v1/fill/w_980,h_1431,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg",
      heroImageAlt: "ResoFusion Niagara Wellness",
      timePlaceRange: "06 may 2023, 9:30 - 07 may 2023, 18:00",
      venue:
        "Niagara Wellness, Akat, Acelya Sk No:43, 34335 Besiktas/Istanbul, Turquia",
      mapQuery: "Niagara Wellness Akat Acelya Sk No 43 Besiktas Istanbul Turkiye",
      aboutTitle: "Acerca del evento",
      aboutBlocks: [
        {
          type: "heading",
          text: "Base del programa"
        },
        {
          type: "p",
          text: "El encuentro combina sesiones transformadoras de DEA con aprendizaje practico de Resosense para el dia a dia."
        },
        {
          type: "heading",
          text: "Aprende Resosense"
        },
        {
          type: "p",
          text: "Resosense se basa en la fisica de la resonancia y utiliza movimientos suaves y especificos que pueden practicarse en pocos minutos al dia."
        },
        {
          type: "list",
          items: [
            "Fisico: apoya movilidad y organizacion corporal.",
            "Emocional: ayuda a liberar estres profundo.",
            "Mental: aporta foco, calma y claridad.",
            "Energetico: apoya equilibrio del sistema energetico."
          ]
        },
        {
          type: "heading",
          text: "Recibe DEA"
        },
        {
          type: "p",
          text: "Mientras una parte del grupo recibe en camillas, el resto sostiene el espacio con presencia enfocada para amplificar el proceso."
        },
        {
          type: "p",
          text: "Referencia del listado original: evento de 2 dias 500 USD. Sesiones privadas con David (50 min): 200 USD."
        }
      ],
      includesTitle: "Incluye",
      includesItems: [
        "Programa ResoFusion de 2 dias.",
        "Sesiones energeticas DEA en grupo.",
        "Guia e integracion de practica Resosense."
      ],
      excludesTitle: "No incluye",
      excludesItems: ["Transporte.", "Alojamiento."],
      hideTicketsCard: true,
      sidebarTicket: {
        title: "Entradas",
        ticketTypeTitle: "",
        ticketTypeValue: "Evento 2 dias: 500 USD",
        currencyHint: "(dolares estadounidenses)",
        infoLines: [
          "Sesiones privadas con David (50 min): 200 USD.",
          "El listado original aparece finalizado."
        ],
        statusMessage: "La reserva ha finalizado."
      }
    }
  }
};

function formatDate(date, language) {
  const locale =
    language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
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
  const copy = labels[currentLanguage] || labels.en;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const eventCustomBySlug = specialEventDetails[slug];
  const customDetails =
    eventCustomBySlug?.[currentLanguage] ??
    (currentLanguage === "de" ? eventCustomBySlug?.en : null) ??
    eventCustomBySlug?.es ??
    eventCustomBySlug?.en ??
    null;
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
