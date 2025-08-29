// Internationalization utilities and types
export type Locale = 'en' | 'es' | 'fr' | 'de';

export interface TranslationKey {
  [key: string]: string;
}

export interface TranslationNamespace {
  [key: string]: TranslationKey;
}

export interface Translations {
  [locale: string]: TranslationNamespace;
}

// Default locale
export const DEFAULT_LOCALE: Locale = 'en';

// Current locale (can be made dynamic later)
export let currentLocale: Locale = DEFAULT_LOCALE;

/**
 * Sets the current locale
 * @param locale - The locale to set
 */
export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
  document.documentElement.lang = locale;
};

/**
 * Gets the current locale
 * @returns The current locale
 */
export const getLocale = (): Locale => {
  return currentLocale;
};

/**
 * Translates a key using the current locale
 * @param namespace - The translation namespace
 * @param key - The translation key
 * @param fallback - Fallback text if translation not found
 * @returns The translated text
 */
export const t = (namespace: string, key: string, fallback?: string): string => {
  // For now, return the fallback or key
  // In a real implementation, this would look up translations
  return fallback || key;
};

/**
 * Formats a number according to the current locale
 * @param number - The number to format
 * @param options - Number formatting options
 * @returns The formatted number string
 */
export const formatNumber = (
  number: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(currentLocale, options).format(number);
};

/**
 * Formats a date according to the current locale
 * @param date - The date to format
 * @param options - Date formatting options
 * @returns The formatted date string
 */
export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Intl.DateTimeFormat(currentLocale, options).format(date);
};

/**
 * Gets the direction (LTR/RTL) for the current locale
 * @returns The text direction
 */
export const getTextDirection = (): 'ltr' | 'rtl' => {
  // For now, all supported locales are LTR
  // Add RTL support when adding Arabic, Hebrew, etc.
  return 'ltr';
};

/**
 * Checks if the current locale is RTL
 * @returns True if the locale is RTL
 */
export const isRTL = (): boolean => {
  return getTextDirection() === 'rtl';
};

// Translation keys for future use
export const TRANSLATION_KEYS = {
  COMMON: {
    SUBMIT: 'common.submit',
    CANCEL: 'common.cancel',
    CLOSE: 'common.close',
    SAVE: 'common.save',
    DELETE: 'common.delete',
    EDIT: 'common.edit',
    ADD: 'common.add',
    REMOVE: 'common.remove',
    YES: 'common.yes',
    NO: 'common.no',
    OK: 'common.ok',
    ERROR: 'common.error',
    SUCCESS: 'common.success',
    WARNING: 'common.warning',
    INFO: 'common.info',
  },
  GAME: {
    TITLE: 'game.title',
    START: 'game.start',
    RESET: 'game.reset',
    NEW_GAME: 'game.newGame',
    GAME_OVER: 'game.gameOver',
    WINNER: 'game.winner',
    CURRENT_PLAYER: 'game.currentPlayer',
    SCORE: 'game.score',
    LIVES: 'game.lives',
    TURN: 'game.turn',
  },
  PLAYER: {
    NAME: 'player.name',
    ADD_PLAYER: 'player.addPlayer',
    REMOVE_PLAYER: 'player.removePlayer',
    PLAYER_COUNT: 'player.playerCount',
    MIN_PLAYERS: 'player.minPlayers',
    MAX_PLAYERS: 'player.maxPlayers',
  },
  VALIDATION: {
    REQUIRED: 'validation.required',
    INVALID_SCORE: 'validation.invalidScore',
    SCORE_TOO_HIGH: 'validation.scoreTooHigh',
    SCORE_TOO_LOW: 'validation.scoreTooLow',
    INVALID_NAME: 'validation.invalidName',
    NAME_TOO_LONG: 'validation.nameTooLong',
    NAME_TOO_SHORT: 'validation.nameTooShort',
  },
  MODES: {
    COUNTDOWN: 'modes.countdown',
    HIGH_LOW: 'modes.highLow',
    COUNTDOWN_DESCRIPTION: 'modes.countdownDescription',
    HIGH_LOW_DESCRIPTION: 'modes.highLowDescription',
  },
} as const;

// Sample translations (for future use)
export const SAMPLE_TRANSLATIONS: Translations = {
  en: {
    common: {
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    game: {
      title: 'Dart Score Manager',
      start: 'Start Game',
      reset: 'Reset Game',
      newGame: 'New Game',
      gameOver: 'Game Over',
      winner: 'Winner',
      currentPlayer: 'Current Player',
      score: 'Score',
      lives: 'Lives',
      turn: 'Turn',
    },
    player: {
      name: 'Player Name',
      addPlayer: 'Add Player',
      removePlayer: 'Remove Player',
      playerCount: 'Player Count',
      minPlayers: 'Minimum Players',
      maxPlayers: 'Maximum Players',
    },
    validation: {
      required: 'This field is required',
      invalidScore: 'Invalid score',
      scoreTooHigh: 'Score cannot exceed 180',
      scoreTooLow: 'Score cannot be negative',
      invalidName: 'Invalid player name',
      nameTooLong: 'Name is too long',
      nameTooShort: 'Name is too short',
    },
    modes: {
      countdown: 'Countdown',
      highLow: 'High-Low Challenge',
      countdownDescription: 'Players start with a score and count down to zero',
      highLowDescription: 'Players compete with lives and set challenges',
    },
  },
  es: {
    common: {
      submit: 'Enviar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      remove: 'Quitar',
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
    },
    game: {
      title: 'Gestor de Puntuación de Dardos',
      start: 'Iniciar Juego',
      reset: 'Reiniciar Juego',
      newGame: 'Nuevo Juego',
      gameOver: 'Fin del Juego',
      winner: 'Ganador',
      currentPlayer: 'Jugador Actual',
      score: 'Puntuación',
      lives: 'Vidas',
      turn: 'Turno',
    },
    player: {
      name: 'Nombre del Jugador',
      addPlayer: 'Agregar Jugador',
      removePlayer: 'Quitar Jugador',
      playerCount: 'Número de Jugadores',
      minPlayers: 'Jugadores Mínimos',
      maxPlayers: 'Jugadores Máximos',
    },
    validation: {
      required: 'Este campo es obligatorio',
      invalidScore: 'Puntuación inválida',
      scoreTooHigh: 'La puntuación no puede exceder 180',
      scoreTooLow: 'La puntuación no puede ser negativa',
      invalidName: 'Nombre de jugador inválido',
      nameTooLong: 'El nombre es demasiado largo',
      nameTooShort: 'El nombre es demasiado corto',
    },
    modes: {
      countdown: 'Cuenta Regresiva',
      highLow: 'Desafío Alto-Bajo',
      countdownDescription: 'Los jugadores comienzan con una puntuación y cuentan hacia cero',
      highLowDescription: 'Los jugadores compiten con vidas y establecen desafíos',
    },
  },
};
