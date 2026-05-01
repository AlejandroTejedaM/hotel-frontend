export abstract class DateFormatterHelper {
  public static formatStringDate(fecha: string): string {
    if (!fecha) return '';
    const [yyyy, mm, dd] = fecha.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  public static formatStringToInputDate(fecha: string): string {
    if (!fecha) return '';
    const [dd, mm, yyyy] = fecha.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
}
