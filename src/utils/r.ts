

export function getHardnessColor(days: string | number): string {
    const colors = {
        green: '#43a047',
        yellow: '#fdd835',
        orange: '#fb8c00',
        red: '#e53935'
    };

    days = Number(days);

    if (!Number.isFinite(days)) {
        return "";
    }

    if (days < 15) {
        return colors.green;
    }

    if (days < 30) {
        return colors.yellow;
    }

    if (days <= 105) {
        return colors.orange;
    }

    return colors.red;
}


type TCommonObj = Record<
  string, 
  string | number | null | undefined
>;

export function  prepareResult(targetObject: TCommonObj[]) {
    const result = targetObject.map((row: TCommonObj) => {
      const obj: TCommonObj = {};

      for (const key in row) {
        const value = row[key];

        obj[key] =
          typeof value === "string"
            ? (value.trim() ? value : "-")
            : value ?? "-";
      }

      return obj;
    });
    return JSON.parse(JSON.stringify(result));
  }


export function setDaysText(days: string | number): string {
    days = Number(days);

    const lastTwoDigits = days % 100;
    const lastDigit = days % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return "дней";
    }

    if (lastDigit === 1) {
        return "день";
    }

    if ([2, 3, 4].includes(lastDigit)) {
        return "дня";
    }

    return "дней";
}


export function getColor(nomenclature: string): string {
    if (!nomenclature) return "";

    const colors: Record<string, string> = {
        'бело-желт': '#f5e6a8',
        'ультрамарин': '#3f51b5',
        'бесцветн': '#d4f1ff',
        'коричнев': '#795548',
        'оранжев': '#fb8c00',
        'фиолетов': '#8e24aa',
        'сиренев': '#ab47bc',
        'бирюз': '#00acc1',
        'бежев': '#c8ad7f',
        'голуб': '#42a5f5',
        'желт': '#fdd835',
        'зелен': '#43a047',
        'красн': '#e53935',
        'розов': '#ec407a',
        'син': '#1e88e5',
        'черн': '#000000',
        'бел': '#ffffff'
    } as const;

    const text = String(nomenclature)
        .toLowerCase()
        .replaceAll('ё', 'е');

    for (const color in colors) {
        if (text.includes(color)) {
        return colors[color]
        }
    }
    return "";
}





