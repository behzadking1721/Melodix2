
import { logger, LogLevel, LogCategory } from "./logger";

export enum ErrorSeverity {
  LOW = 'low',       // Snackbar only
  MEDIUM = 'medium', // Toast/Alert
  HIGH = 'high'      // Dialog
}

export interface MelodixError {
  code: string;
  message: string;
  technicalMessage?: string;
  severity: ErrorSeverity;
  category: LogCategory;
}

class ErrorService {
  private static instance: ErrorService;
  private errorListeners: ((error: MelodixError) => void)[] = [];

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) ErrorService.instance = new ErrorService();
    return ErrorService.instance;
  }

  public subscribe(callback: (error: MelodixError) => void) {
    this.errorListeners.push(callback);
    return () => { this.errorListeners = this.errorListeners.filter(l => l !== callback); };
  }

  public handleError(technicalError: any, context: string, category: LogCategory, severity: ErrorSeverity = ErrorSeverity.MEDIUM) {
    const message = this.mapToUserFriendly(technicalError);
    
    const error: MelodixError = {
      code: technicalError?.code || 'ERR_GENERIC',
      message: message,
      technicalMessage: technicalError?.message || String(technicalError),
      severity,
      category
    };

    logger.log(
      severity === ErrorSeverity.HIGH ? LogLevel.FATAL : LogLevel.ERROR,
      category,
      `Error in ${context}: ${error.message}`,
      { tech: error.technicalMessage }
    );

    this.errorListeners.forEach(listener => listener(error));
  }

  private mapToUserFriendly(err: any): string {
    const msg = String(err).toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) return "خطا در اتصال به شبکه. لطفاً اینترنت خود را بررسی کنید.";
    if (msg.includes('permission') || msg.includes('access')) return "عدم دسترسی به فایل. لطفاً مجوزهای لازم را بررسی کنید.";
    if (msg.includes('quota') || msg.includes('limit')) return "محدودیت استفاده از هوش مصنوعی به پایان رسیده است.";
    if (msg.includes('decode')) return "خطا در رمزگشایی فایل صوتی. فرمت فایل ممکن است پشتیبانی نشود.";
    return "یک خطای غیرمنتظره رخ داد. تیم فنی در حال بررسی است.";
  }
}

export const errorService = ErrorService.getInstance();
