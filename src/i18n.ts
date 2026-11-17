import { Language } from './types';

export const TRANSLATIONS: Record<
  Language,
  {
    brand: string;
    tabs: {
      today: string;
      stats: string;
    };
    topBar: {
      settingsLabel: string;
    };
    today: {
      inactiveTitle: string;
      inactiveSubtitle: string;
      activeNormal: string;
      activeStrict: string;
      activateButton: string;
      manageButton: string;
      rulesSummary: string;
      exemptSummary: string;
      usedTodayWord: string;
      availableWord: string;
      pauseLead: string;
      pauseDetail: string;
      exhaustedLead: string;
      exhaustedDetail: string;
      pendingDeactivationBeforeTime: string;
      cancelRequest: string;
      strictPinActiveHint: string;
      appBlockTitle: string;
      appBlockDesc: string;
      appBlockActiveTimer: (mins: number, targetSummary: string) => string;
      appBlockActiveSchedule: (
        start: string,
        end: string,
        targetSummary: string
      ) => string;
      appBlockActivePassword: (targetSummary: string) => string;
      appCountLabel: (count: number) => string;
      methodTimer: string;
      methodSchedule: string;
      methodPassword: string;
    };
    activateDialog: {
      title: string;
      normalTitle: string;
      normalDesc: string;
      strictTitle: string;
      strictDesc: string;
      pinLabel: string;
      pinConfirmLabel: string;
      pinPlaceholder: string;
      pinTooShort: string;
      pinMismatch: string;
      confirmButton: string;
      cancelButton: string;
    };
    manageDialog: {
      title: string;
      currentNormal: string;
      currentStrict: string;
      deactivateIn15Title: string;
      deactivateIn15Desc: string;
      switchToStrictTitle: string;
      switchToStrictDesc: string;
      pendingBeforeTime: string;
      cancelRequest: string;
      backToNormalWithPin: string;
      backToNormalDesc: string;
      deactivateWithPin: string;
      deactivateWithPinDesc: string;
      enterPinPrompt: string;
      pinPlaceholder: string;
      pinInvalid: string;
      confirmPinAction: string;
      backButton: string;
      close: string;
    };
    appBlockDialog: {
      titleTimer: string;
      titleSchedule: string;
      titlePassword: string;
      categoriesLabel: string;
      categoriesHint: string;
      categories: {
        social: string;
        video: string;
        games: string;
        browsers: string;
      };
      deviceAppsLabel: string;
      searchOrAddPlaceholder: string;
      addAppButton: string;
      nativeAppsEmptyHint: string;
      durationLabel: string;
      daysLabel: string;
      hoursLabel: string;
      fromLabel: string;
      toLabel: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      passwordHint: string;
      activateBlock: string;
      disableBlock: string;
      close: string;
    };
    stats: {
      title: string;
      usedTodayLabel: string;
      ofMaxDaily: string;
      byNetworkTitle: string;
      weeklyTitle: string;
      emptyToday: string;
      emptyWeekly: string;
      exemptTitle: string;
      exemptBody: string;
      minUnit: string;
    };
    settings: {
      title: string;
      advancedTitle: string;
      uninstallTitle: string;
      uninstallDesc: string;
      uninstallPinPrompt: string;
      uninstallPinInvalid: string;
      uninstallConfirm: string;
      uninstallCancel: string;
      languageLabel: string;
      themeLabel: string;
      themeDark: string;
      themeLight: string;
      androidLabel: string;
      androidConnected: string;
      androidPending: string;
      androidPerms: {
        deviceAdmin: { title: string; desc: string };
        accessibility: { title: string; desc: string };
        usageStats: { title: string; desc: string };
        overlay: { title: string; desc: string };
      };
      close: string;
      footerNote: string;
    };
    weekdaysShort: string[];
  }
> = {
  es: {
    brand: 'focus',
    tabs: {
      today: 'Hoy',
      stats: 'Estadísticas',
    },
    topBar: {
      settingsLabel: 'Ajustes',
    },
    today: {
      inactiveTitle: 'Focus desactivado',
      inactiveSubtitle:
        'Actívalo para limitar el scroll automático en redes compatibles a 30 min al día.',
      activeNormal: 'Focus activo · Normal',
      activeStrict: 'Focus activo · Estricto',
      activateButton: 'Activar Focus',
      manageButton: 'Gestionar Focus',
      rulesSummary:
        '15 min iniciales de scroll · Pausa automática de 2 h · Máximo 30 min diarios',
      exemptSummary:
        'Focus limita los feeds compatibles de Instagram, TikTok y YouTube. Mensajes y búsqueda siguen disponibles.',
      usedTodayWord: 'min usados hoy',
      availableWord: 'min disponibles',
      pauseLead: 'Vuelves a tener 15 min a las',
      pauseDetail: '15 min usados hoy · Pausa automática de 2 h',
      exhaustedLead: 'min usados hoy · Disponible mañana',
      exhaustedDetail:
        'Límite diario de 30 min completado. Mensajes y búsqueda siguen disponibles.',
      pendingDeactivationBeforeTime: 'Focus se desactivará a las',
      cancelRequest: 'Cancelar solicitud',
      strictPinActiveHint:
        'Protegido con PIN. Necesitarás introducirlo para desactivar o volver a Normal.',
      appBlockTitle: 'Bloquear apps',
      appBlockDesc:
        'Bloqueador independiente para aplicaciones concretas, aparte del límite de scroll.',
      appBlockActiveTimer: (mins, targetSummary) =>
        `Activo · Temporizador de ${mins} min · ${targetSummary}`,
      appBlockActiveSchedule: (start, end, targetSummary) =>
        `Activo · Horario ${start}–${end} · ${targetSummary}`,
      appBlockActivePassword: (targetSummary) =>
        `Activo · Con contraseña · ${targetSummary}`,
      appCountLabel: (count) =>
        count === 1 ? '1 app' : `${count} apps`,
      methodTimer: 'Temporizador',
      methodSchedule: 'Horario',
      methodPassword: 'Con contraseña',
    },
    activateDialog: {
      title: 'Elige cómo quieres usar Focus',
      normalTitle: 'Normal · Espera de 15 min',
      normalDesc: 'Para desactivar Focus, tendrás que esperar 15 minutos.',
      strictTitle: 'Estricto · Con PIN',
      strictDesc:
        'Para desactivar Focus o volver a Normal, necesitarás introducir tu PIN.',
      pinLabel: 'Configurar PIN',
      pinConfirmLabel: 'Confirmar PIN',
      pinPlaceholder: 'Mínimo 4 dígitos',
      pinTooShort: 'El PIN debe tener al menos 4 dígitos.',
      pinMismatch: 'Los PIN no coinciden.',
      confirmButton: 'Activar Focus',
      cancelButton: 'Cancelar',
    },
    manageDialog: {
      title: 'Gestionar Focus',
      currentNormal: 'Focus activo · Normal (espera de 15 min)',
      currentStrict: 'Focus activo · Estricto (protegido con PIN)',
      deactivateIn15Title: 'Desactivar en 15 min',
      deactivateIn15Desc:
        'Focus seguirá activo durante 15 minutos antes de desactivarse.',
      switchToStrictTitle: 'Cambiar a Estricto · Con PIN',
      switchToStrictDesc:
        'Protege la desactivación y el regreso a Normal mediante un PIN.',
      pendingBeforeTime: 'Focus se desactivará a las',
      cancelRequest: 'Cancelar solicitud',
      backToNormalWithPin: 'Volver a Normal',
      backToNormalDesc: 'Requiere introducir tu PIN para pasar a modo Normal.',
      deactivateWithPin: 'Desactivar con PIN',
      deactivateWithPinDesc: 'Requiere introducir tu PIN para apagar Focus.',
      enterPinPrompt: 'Introduce tu PIN para confirmar',
      pinPlaceholder: 'PIN',
      pinInvalid: 'El PIN no es correcto.',
      confirmPinAction: 'Confirmar',
      backButton: 'Atrás',
      close: 'Cerrar',
    },
    appBlockDialog: {
      titleTimer: 'Bloquear apps · Temporizador',
      titleSchedule: 'Bloquear apps · Horario',
      titlePassword: 'Bloquear apps · Con contraseña',
      categoriesLabel: 'Bloquear por categoría',
      categoriesHint: 'Aplica a todas las apps de esa categoría en tu dispositivo.',
      categories: {
        social: 'Redes sociales',
        video: 'Vídeo y streaming',
        games: 'Juegos',
        browsers: 'Navegadores',
      },
      deviceAppsLabel: 'Apps del dispositivo',
      searchOrAddPlaceholder: 'Buscar o escribir nombre de app…',
      addAppButton: 'Añadir',
      nativeAppsEmptyHint:
        'En Android aparecerán aquí automáticamente tus apps instaladas; también puedes añadir una por nombre.',
      durationLabel: 'Duración del bloqueo',
      daysLabel: 'Días activos',
      hoursLabel: 'Franja horaria',
      fromLabel: 'Desde',
      toLabel: 'Hasta',
      passwordLabel: 'Contraseña de desbloqueo',
      passwordPlaceholder: 'Mínimo 4 caracteres',
      passwordHint:
        'La contraseña se mantiene solo en este bloqueador independiente de apps.',
      activateBlock: 'Guardar bloqueo',
      disableBlock: 'Desactivar bloqueo',
      close: 'Cerrar',
    },
    stats: {
      title: 'Estadísticas',
      usedTodayLabel: 'Scroll usado hoy',
      ofMaxDaily: 'de 30 min diarios',
      byNetworkTitle: 'Redes compatibles hoy',
      weeklyTitle: 'Últimos 7 días',
      emptyToday: 'Aún no has usado tiempo de scroll hoy.',
      emptyWeekly: 'Aún no hay datos de scroll esta semana.',
      exemptTitle: 'Siempre disponibles',
      exemptBody:
        'Mensajes y búsqueda no consumen saldo de scroll.',
      minUnit: 'min',
    },
    settings: {
      title: 'Ajustes',
      advancedTitle: 'Ajustes avanzados',
      uninstallTitle: 'Protección contra desinstalación',
      uninstallDesc:
        'Impide eliminar Focus desde los ajustes de Android mientras el permiso de administrador esté activo.',
      uninstallPinPrompt: 'Introduce tu PIN para desactivar esta protección',
      uninstallPinInvalid: 'El PIN no es correcto.',
      uninstallConfirm: 'Desactivar protección',
      uninstallCancel: 'Cancelar',
      languageLabel: 'Idioma',
      themeLabel: 'Apariencia',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      androidLabel: 'Permisos del dispositivo (Android)',
      androidConnected: 'Activo',
      androidPending: 'Sin permiso',
      androidPerms: {
        deviceAdmin: {
          title: 'Administrador del dispositivo',
          desc: 'Bloquea la desinstalación de la app desde los ajustes del sistema.',
        },
        accessibility: {
          title: 'Servicio de Accesibilidad',
          desc: 'Detecta y limita el feed infinito manteniendo mensajes y búsqueda.',
        },
        usageStats: {
          title: 'Acceso a datos de uso',
          desc: 'Mide el tiempo real de scroll en redes compatibles.',
        },
        overlay: {
          title: 'Mostrar sobre otras apps',
          desc: 'Aplica los bloqueos activos en pantalla.',
        },
      },
      close: 'Cerrar',
      footerNote: 'Reinicio diario automático a medianoche (hora local)',
    },
    weekdaysShort: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  },
  en: {
    brand: 'focus',
    tabs: {
      today: 'Today',
      stats: 'Stats',
    },
    topBar: {
      settingsLabel: 'Settings',
    },
    today: {
      inactiveTitle: 'Focus is off',
      inactiveSubtitle:
        'Turn it on to limit infinite feed scrolling on compatible networks to 30 min a day.',
      activeNormal: 'Focus active · Normal',
      activeStrict: 'Focus active · Strict',
      activateButton: 'Activate Focus',
      manageButton: 'Manage Focus',
      rulesSummary:
        '15 min initial scroll · Automatic 2 h pause · 30 min daily maximum',
      exemptSummary:
        'Focus limits supported feeds in Instagram, TikTok and YouTube. Messages and search stay available.',
      usedTodayWord: 'min used today',
      availableWord: 'min available',
      pauseLead: '15 min available again at',
      pauseDetail: '15 min used today · Automatic 2 h pause',
      exhaustedLead: 'min used today · Available tomorrow',
      exhaustedDetail:
        'Daily 30 min limit reached. Messages and search remain available.',
      pendingDeactivationBeforeTime: 'Focus will turn off at',
      cancelRequest: 'Cancel request',
      strictPinActiveHint:
        'Protected with PIN. Required to turn off Focus or return to Normal.',
      appBlockTitle: 'Block apps',
      appBlockDesc:
        'Independent blocker for specific apps, separate from the daily scroll limit.',
      appBlockActiveTimer: (mins, targetSummary) =>
        `Active · ${mins} min timer · ${targetSummary}`,
      appBlockActiveSchedule: (start, end, targetSummary) =>
        `Active · Schedule ${start}–${end} · ${targetSummary}`,
      appBlockActivePassword: (targetSummary) =>
        `Active · Password lock · ${targetSummary}`,
      appCountLabel: (count) =>
        count === 1 ? '1 app' : `${count} apps`,
      methodTimer: 'Timer',
      methodSchedule: 'Schedule',
      methodPassword: 'With password',
    },
    activateDialog: {
      title: 'Choose how to use Focus',
      normalTitle: 'Normal · 15 min wait',
      normalDesc: 'To turn off Focus, you will need to wait 15 minutes.',
      strictTitle: 'Strict · With PIN',
      strictDesc:
        'To turn off Focus or return to Normal, you will need to enter your PIN.',
      pinLabel: 'Set PIN',
      pinConfirmLabel: 'Confirm PIN',
      pinPlaceholder: 'At least 4 digits',
      pinTooShort: 'PIN must be at least 4 characters.',
      pinMismatch: 'PINs do not match.',
      confirmButton: 'Activate Focus',
      cancelButton: 'Cancel',
    },
    manageDialog: {
      title: 'Manage Focus',
      currentNormal: 'Focus active · Normal (15 min wait)',
      currentStrict: 'Focus active · Strict (PIN protected)',
      deactivateIn15Title: 'Turn off in 15 min',
      deactivateIn15Desc: 'Focus stays active for 15 minutes before turning off.',
      switchToStrictTitle: 'Switch to Strict · With PIN',
      switchToStrictDesc:
        'Protects turning off or switching back to Normal with a PIN.',
      pendingBeforeTime: 'Focus will turn off at',
      cancelRequest: 'Cancel request',
      backToNormalWithPin: 'Return to Normal',
      backToNormalDesc: 'Requires entering your PIN to return to Normal mode.',
      deactivateWithPin: 'Turn off with PIN',
      deactivateWithPinDesc: 'Requires entering your PIN to turn off Focus.',
      enterPinPrompt: 'Enter your PIN to confirm',
      pinPlaceholder: 'PIN',
      pinInvalid: 'Incorrect PIN.',
      confirmPinAction: 'Confirm',
      backButton: 'Back',
      close: 'Close',
    },
    appBlockDialog: {
      titleTimer: 'Block apps · Timer',
      titleSchedule: 'Block apps · Schedule',
      titlePassword: 'Block apps · With password',
      categoriesLabel: 'Block by category',
      categoriesHint: 'Applies to all apps in that category on your device.',
      categories: {
        social: 'Social media',
        video: 'Video & streaming',
        games: 'Games',
        browsers: 'Browsers',
      },
      deviceAppsLabel: 'Device apps',
      searchOrAddPlaceholder: 'Search or type an app name…',
      addAppButton: 'Add',
      nativeAppsEmptyHint:
        'On Android your installed apps appear here automatically; you can also add one by name.',
      durationLabel: 'Block duration',
      daysLabel: 'Active days',
      hoursLabel: 'Time window',
      fromLabel: 'From',
      toLabel: 'To',
      passwordLabel: 'Unlock password',
      passwordPlaceholder: 'At least 4 characters',
      passwordHint:
        'Password lock remains only in this independent app blocker.',
      activateBlock: 'Save block',
      disableBlock: 'Turn off block',
      close: 'Close',
    },
    stats: {
      title: 'Stats',
      usedTodayLabel: 'Scroll used today',
      ofMaxDaily: 'of 30 min daily',
      byNetworkTitle: 'Compatible networks today',
      weeklyTitle: 'Last 7 days',
      emptyToday: 'No scroll time recorded today yet.',
      emptyWeekly: 'No scroll data recorded this week yet.',
      exemptTitle: 'Always available',
      exemptBody:
        'Messages and search do not consume scroll balance.',
      minUnit: 'min',
    },
    settings: {
      title: 'Settings',
      advancedTitle: 'Advanced settings',
      uninstallTitle: 'Uninstall protection',
      uninstallDesc:
        'Prevents removing Focus from Android settings while Device Admin permission is active.',
      uninstallPinPrompt: 'Enter your PIN to turn off uninstall protection',
      uninstallPinInvalid: 'Incorrect PIN.',
      uninstallConfirm: 'Disable protection',
      uninstallCancel: 'Cancel',
      languageLabel: 'Language',
      themeLabel: 'Appearance',
      themeDark: 'Dark',
      themeLight: 'Light',
      androidLabel: 'Device permissions (Android)',
      androidConnected: 'Active',
      androidPending: 'Not granted',
      androidPerms: {
        deviceAdmin: {
          title: 'Device Administrator',
          desc: 'Blocks app uninstallation from Android system settings.',
        },
        accessibility: {
          title: 'Accessibility Service',
          desc: 'Detects and limits infinite feeds while keeping messages and search available.',
        },
        usageStats: {
          title: 'Usage Access',
          desc: 'Measures real scroll time across compatible networks.',
        },
        overlay: {
          title: 'Display over other apps',
          desc: 'Applies active locks on screen.',
        },
      },
      close: 'Close',
      footerNote: 'Resets daily at local midnight',
    },
    weekdaysShort: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
};
