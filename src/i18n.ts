import { Language, PlanProtectionMode, RuleMode, WeekdayKey } from './types';

export const TRANSLATIONS: Record<Language, {
  brand: string;
  tabs: {
    plans: string;
    stats: string;
  };
  weekdays: Record<WeekdayKey, string>;
  durations: Record<string, string>;
  plans: {
    title: string;
    subtitle: string;
    activeLabel: string;
    createButton: string;
    statusActive: string;
    statusPaused: string;
    emptyTitle: string;
    emptyBody: string;
    configuredNotice: (antiCount: number, blockCount: number) => string;
  };
  stats: {
    title: string;
    subtitle: string;
    periods: {
      today: string;
      d7: string;
      d30: string;
    };
    totalUsageLabel: string;
    hoursFormatHint: string;
    hourlyChartTitle: string;
    appUsageTitle: string;
    noAppUsage: string;
  };
  editor: {
    createTitle: string;
    editTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    tabs: {
      antiscroll: string;
      block: string;
    };
    enableAntiscroll: string;
    enableAntiscrollDesc: string;
    enableBlock: string;
    enableBlockDesc: string;
    socialAppsLabel: string;
    blockAppsLabel: string;
    searchAppsPlaceholder: string;
    addCustomAppPlaceholder: string;
    addCustomAppButton: string;
    futureAnyAppTitle: string;
    futureAnyAppDesc: string;
    stripElementsTitle: string;
    stripElementsHint: string;
    modeSectionLabel: string;
    modes: Record<RuleMode, { title: string; desc: string }>;
    dailyMaxLabel: string;
    dailyMaxHint: (m: number, target: string) => string;
    durationPickLabel: string;
    daysPickLabel: string;
    quickWeekdays: string;
    quickWeekend: string;
    quickAllDays: string;
    quickSleepHygiene: string;
    startLabel: string;
    endLabel: string;
    protectionLabel: string;
    protectionModes: Record<PlanProtectionMode, { title: string; desc: string }>;
    passwordInputLabel: string;
    passwordPlaceholder: string;
    passwordDefaultHint: string;
    save: string;
    create: string;
    delete: string;
    cancel: string;
    defaultNewName: string;
    divisionSummary: (antiApps: number, blockApps: number) => string;
  };
  passwordModal: {
    title: string;
    subtitle: (planName: string) => string;
    placeholder: string;
    unlockButton: string;
    cancel: string;
    wrongError: string;
  };
  delayModal: {
    title: string;
    subtitle: (planName: string) => string;
    inhale: string;
    hold: string;
    exhale: string;
    waitHint: string;
    readyHint: string;
    intentionLabel: string;
    intentions: string[];
    keepActive: string;
    proceed: string;
    cancel: string;
  };
  settings: {
    title: string;
    languageLabel: string;
    languageDesc: string;
    themeLabel: string;
    themeDesc: string;
    themeDark: string;
    themeLight: string;
    androidLabel: string;
    androidBadge: string;
    androidPerms: {
      accessibility: { title: string; desc: string };
      usageStats: { title: string; desc: string };
      overlay: { title: string; desc: string };
    };
    futureLabel: string;
    comingSoon: string;
    futureItems: {
      grayscale: { title: string; desc: string };
      antiUninstall: { title: string; desc: string };
      haptics: { title: string; desc: string };
      profiles: { title: string; desc: string };
    };
    close: string;
    conceptNote: string;
  };
}> = {
  es: {
    brand: 'focus',
    tabs: {
      plans: 'Planes',
      stats: 'Estadísticas',
    },
    weekdays: {
      mon: 'L',
      tue: 'M',
      wed: 'X',
      thu: 'J',
      fri: 'V',
      sat: 'S',
      sun: 'D',
    },
    durations: {
      '2h': '2 horas',
      '1d': '1 día entero',
      '3d': '3 días',
      '7d': '1 semana',
      '14d': '2 semanas',
      '30d': '1 mes',
    },
    plans: {
      title: 'Planes',
      subtitle: 'Crea un plan y divídelo en anti-scroll y bloqueo.',
      activeLabel: 'Activos',
      createButton: 'Crear plan',
      statusActive: 'Activo',
      statusPaused: 'Pausado',
      emptyTitle: 'Sin planes guardados',
      emptyBody: 'Pulsa Crear plan para configurar tu primer plan de anti-scroll o bloqueo.',
      configuredNotice: (antiCount, blockCount) =>
        `${antiCount} anti-scroll · ${blockCount} bloqueo`,
    },
    stats: {
      title: 'Estadísticas',
      subtitle: 'Horas y tiempo de uso de cada aplicación.',
      periods: {
        today: 'Hoy',
        d7: '7 días',
        d30: '30 días',
      },
      totalUsageLabel: 'Tiempo total de uso',
      hoursFormatHint: 'HH:MM',
      hourlyChartTitle: 'Distribución por horas',
      appUsageTitle: 'Tiempo de uso por aplicación',
      noAppUsage: 'Sin horas de uso registradas todavía.',
    },
    editor: {
      createTitle: 'Crear plan',
      editTitle: 'Configurar plan',
      nameLabel: 'Nombre del plan',
      namePlaceholder: 'Nombre del plan',
      tabs: {
        antiscroll: 'Anti-scroll',
        block: 'Bloqueo',
      },
      enableAntiscroll: 'Activar Anti-scroll',
      enableAntiscrollDesc: 'Dedicado a redes sociales: elimina el bucle dopaminérgico manteniendo mensajes y búsquedas útiles.',
      enableBlock: 'Activar Bloqueo',
      enableBlockDesc: 'Bloquea por completo el acceso a las aplicaciones elegidas.',
      socialAppsLabel: 'Redes sociales',
      blockAppsLabel: 'Aplicaciones a bloquear',
      searchAppsPlaceholder: 'Buscar aplicación...',
      addCustomAppPlaceholder: 'Añadir otra aplicación...',
      addCustomAppButton: 'Añadir',
      futureAnyAppTitle: 'Lista completa de apps instaladas (Android)',
      futureAnyAppDesc: 'Al compilar la APK cargará automáticamente todas las apps del teléfono.',
      stripElementsTitle: 'Elementos a eliminar de cada red social',
      stripElementsHint: 'Suprime el refuerzo variable y el escroleo infinito.',
      modeSectionLabel: 'Modo de aplicación',
      modes: {
        daily_limit: {
          title: 'Uso diario máximo',
          desc: 'Al superar X tiempo en la app, se activa automáticamente.',
        },
        always: {
          title: 'Desde el primer segundo',
          desc: 'Se aplica al instante cada vez que entras en la app.',
        },
        duration: {
          title: 'Por tiempo',
          desc: 'Activo de continuo durante horas, un día entero o una semana.',
        },
        days: {
          title: 'Por días y horarios',
          desc: 'Elige qué días de la semana y qué horas se aplica.',
        },
      },
      dailyMaxLabel: 'Tiempo máximo diario',
      dailyMaxHint: (m, target) =>
        `Al superar ${String(m).padStart(2, '0')} min diarios, se aplica ${target}.`,
      durationPickLabel: 'Duración continua',
      daysPickLabel: 'Días activos',
      quickWeekdays: 'Entre semana',
      quickWeekend: 'Fin de semana',
      quickAllDays: 'Todos',
      quickSleepHygiene: 'Sueño (22:30–07:30)',
      startLabel: 'Inicio',
      endLabel: 'Fin',
      protectionLabel: 'Fricción y protección del plan',
      protectionModes: {
        normal: {
          title: 'Estándar',
          desc: 'Puedes pausar o editar el plan cuando quieras.',
        },
        delay: {
          title: 'Pausa de respiración (10s)',
          desc: 'Interrumpe el impulso automático con respiración e intención consciente.',
        },
        password: {
          title: 'Con contraseña (Estricto)',
          desc: 'Solo se puede quitar o editar introduciendo la contraseña.',
        },
      },
      passwordInputLabel: 'Contraseña de desbloqueo',
      passwordPlaceholder: 'Escribe una contraseña...',
      passwordDefaultHint: 'Se pedirá al intentar pausar o modificar el plan activo.',
      save: 'Guardar plan',
      create: 'Crear plan',
      delete: 'Eliminar plan',
      cancel: 'Cancelar',
      defaultNewName: 'Plan personalizado',
      divisionSummary: (antiApps, blockApps) =>
        `Anti-scroll: ${antiApps} redes · Bloqueo: ${blockApps} apps`,
    },
    passwordModal: {
      title: 'Plan protegido',
      subtitle: (planName) => `Introduce la contraseña para modificar o pausar "${planName}".`,
      placeholder: 'Contraseña',
      unlockButton: 'Desbloquear',
      cancel: 'Cancelar',
      wrongError: 'Contraseña incorrecta.',
    },
    delayModal: {
      title: 'Pausa consciente',
      subtitle: (planName) => `Rompe el impulso antes de modificar "${planName}".`,
      inhale: 'Inhala lento',
      hold: 'Mantén',
      exhale: 'Exhala despacio',
      waitHint: 'Activa el control consciente antes de decidir.',
      readyHint: '¿Seguro que quieres desactivar esta protección?',
      intentionLabel: 'Motivo',
      intentions: ['Necesidad puntual', 'Trabajo / Estudio', 'Ajustar horario'],
      keepActive: 'Mantener activo',
      proceed: 'Continuar',
      cancel: 'Cancelar',
    },
    settings: {
      title: 'Ajustes',
      languageLabel: 'Idioma',
      languageDesc: 'Idioma de la interfaz',
      themeLabel: 'Apariencia',
      themeDesc: 'Contraste monocromo claro u oscuro',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      androidLabel: 'Permisos necesarios en Android (APK)',
      androidBadge: 'Pendiente APK',
      androidPerms: {
        accessibility: {
          title: 'Servicio de Accesibilidad',
          desc: 'Detecta la app abierta y oculta feeds o botones de scroll.',
        },
        usageStats: {
          title: 'Acceso a datos de uso',
          desc: 'Mide las horas exactas por app y activa límites diarios.',
        },
        overlay: {
          title: 'Mostrar sobre otras apps',
          desc: 'Muestra la pantalla de bloqueo al superar el límite.',
        },
      },
      futureLabel: 'Salud digital avanzada (APK)',
      comingSoon: 'Futuro',
      futureItems: {
        grayscale: {
          title: 'Escala de grises automática',
          desc: 'Reduce el estímulo visual de color al activar un plan.',
        },
        antiUninstall: {
          title: 'Protección anti-desinstalación',
          desc: 'Evita borrar la app mientras haya un plan estricto activo.',
        },
        haptics: {
          title: 'Respuesta háptica',
          desc: 'Pulsos táctiles suaves al cortar scroll infinito.',
        },
        profiles: {
          title: 'Perfiles por contexto',
          desc: 'Activación automática según ubicación o calendario.',
        },
      },
      close: 'Cerrar',
      conceptNote: 'Memoria local activa · Preparado para puente nativo Android',
    },
  },
  en: {
    brand: 'focus',
    tabs: {
      plans: 'Plans',
      stats: 'Stats',
    },
    weekdays: {
      mon: 'M',
      tue: 'T',
      wed: 'W',
      thu: 'T',
      fri: 'F',
      sat: 'S',
      sun: 'S',
    },
    durations: {
      '2h': '2 hours',
      '1d': '1 full day',
      '3d': '3 days',
      '7d': '1 week',
      '14d': '2 weeks',
      '30d': '1 month',
    },
    plans: {
      title: 'Plans',
      subtitle: 'Create a plan and divide it into anti-scroll and app block.',
      activeLabel: 'Active',
      createButton: 'Create plan',
      statusActive: 'Active',
      statusPaused: 'Paused',
      emptyTitle: 'No saved plans',
      emptyBody: 'Tap Create plan to configure your first anti-scroll or block plan.',
      configuredNotice: (antiCount, blockCount) =>
        `${antiCount} anti-scroll · ${blockCount} block`,
    },
    stats: {
      title: 'Statistics',
      subtitle: 'Hours and usage time per application.',
      periods: {
        today: 'Today',
        d7: '7 days',
        d30: '30 days',
      },
      totalUsageLabel: 'Total usage time',
      hoursFormatHint: 'HH:MM',
      hourlyChartTitle: 'Usage distribution',
      appUsageTitle: 'Usage time per app',
      noAppUsage: 'No app usage time recorded yet.',
    },
    editor: {
      createTitle: 'Create plan',
      editTitle: 'Configure plan',
      nameLabel: 'Plan name',
      namePlaceholder: 'Plan name',
      tabs: {
        antiscroll: 'Anti-scroll',
        block: 'Block',
      },
      enableAntiscroll: 'Enable Anti-scroll',
      enableAntiscrollDesc: 'For social networks: removes dopamine scroll loops while keeping useful messaging and search.',
      enableBlock: 'Enable App Block',
      enableBlockDesc: 'Completely blocks opening the selected applications.',
      socialAppsLabel: 'Social networks',
      blockAppsLabel: 'Applications to block',
      searchAppsPlaceholder: 'Search application...',
      addCustomAppPlaceholder: 'Add another application...',
      addCustomAppButton: 'Add',
      futureAnyAppTitle: 'Full installed apps list (Android)',
      futureAnyAppDesc: 'When compiled as an APK, loads every installed app automatically.',
      stripElementsTitle: 'Elements to remove per social app',
      stripElementsHint: 'Removes variable-ratio triggers and infinite scroll.',
      modeSectionLabel: 'Activation mode',
      modes: {
        daily_limit: {
          title: 'Daily usage limit',
          desc: 'Activates automatically once you exceed X minutes in the app.',
        },
        always: {
          title: 'From the first second',
          desc: 'Applies immediately every time you open the app.',
        },
        duration: {
          title: 'By duration',
          desc: 'Continuous lock for hours, a full day, or an entire week.',
        },
        days: {
          title: 'By days & hours',
          desc: 'Pick which weekdays and hours it applies.',
        },
      },
      dailyMaxLabel: 'Max daily usage',
      dailyMaxHint: (m, target) =>
        `After ${String(m).padStart(2, '0')} min daily, ${target} activates.`,
      durationPickLabel: 'Continuous duration',
      daysPickLabel: 'Active days',
      quickWeekdays: 'Weekdays',
      quickWeekend: 'Weekend',
      quickAllDays: 'All',
      quickSleepHygiene: 'Sleep (22:30–07:30)',
      startLabel: 'Start',
      endLabel: 'End',
      protectionLabel: 'Friction & protection',
      protectionModes: {
        normal: {
          title: 'Standard',
          desc: 'Pause or edit the plan at any time.',
        },
        delay: {
          title: '10s breathing pause',
          desc: 'Interrupts automatic impulse with breathing and conscious intent.',
        },
        password: {
          title: 'Password locked (Strict)',
          desc: 'Cannot be disabled or edited without entering the password.',
        },
      },
      passwordInputLabel: 'Unlock password',
      passwordPlaceholder: 'Enter a password...',
      passwordDefaultHint: 'Required to turn off or edit this plan while active.',
      save: 'Save plan',
      create: 'Create plan',
      delete: 'Delete plan',
      cancel: 'Cancel',
      defaultNewName: 'Custom plan',
      divisionSummary: (antiApps, blockApps) =>
        `Anti-scroll: ${antiApps} social · Block: ${blockApps} apps`,
    },
    passwordModal: {
      title: 'Password protected',
      subtitle: (planName) => `Enter the password to edit or pause "${planName}".`,
      placeholder: 'Password',
      unlockButton: 'Unlock',
      cancel: 'Cancel',
      wrongError: 'Incorrect password.',
    },
    delayModal: {
      title: 'Conscious pause',
      subtitle: (planName) => `Interrupt the impulse before modifying "${planName}".`,
      inhale: 'Breathe in',
      hold: 'Hold',
      exhale: 'Breathe out',
      waitHint: 'Shift from habit loop to deliberate choice.',
      readyHint: 'Do you still want to disable this rule?',
      intentionLabel: 'Reason',
      intentions: ['Specific task', 'Work / Study', 'Adjust schedule'],
      keepActive: 'Keep active',
      proceed: 'Continue',
      cancel: 'Cancel',
    },
    settings: {
      title: 'Settings',
      languageLabel: 'Language',
      languageDesc: 'Interface language',
      themeLabel: 'Appearance',
      themeDesc: 'Monochrome light or dark contrast',
      themeDark: 'Dark',
      themeLight: 'Light',
      androidLabel: 'Required Android permissions (APK)',
      androidBadge: 'APK hook',
      androidPerms: {
        accessibility: {
          title: 'Accessibility Service',
          desc: 'Detects active app and hides infinite feeds or scroll nodes.',
        },
        usageStats: {
          title: 'Usage Access',
          desc: 'Reads per-app screen hours and triggers daily limits.',
        },
        overlay: {
          title: 'Display over other apps',
          desc: 'Renders the monochrome block screen over restricted apps.',
        },
      },
      futureLabel: 'Behavioral health roadmap (APK)',
      comingSoon: 'Planned',
      futureItems: {
        grayscale: {
          title: 'Automatic grayscale',
          desc: 'Reduces chromatic reward cues while a plan is active.',
        },
        antiUninstall: {
          title: 'Anti-uninstall lock',
          desc: 'Prevents removing the app during strict password plans.',
        },
        haptics: {
          title: 'Haptic feedback',
          desc: 'Subtle tactile ticks when cutting infinite scroll.',
        },
        profiles: {
          title: 'Context profiles',
          desc: 'Trigger rules automatically by location or calendar.',
        },
      },
      close: 'Close',
      conceptNote: 'Local persistence active · Ready for Android native bridge',
    },
  },
};
