export function format(template: string, ...args: any[]): string {
    return args.reduce<string>(
        (template, val) => template.replace("{}", val),
        template,
    )
}

export function formatN(template: string, args: Record<string, any>): string {
    return Object.entries(args).reduce(
        (template, [key, val]) => template.replace(`{${key}}`, val),
        template,
    )
}
