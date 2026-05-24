export const MESSAGE_TEMPLATE_TYPES = [
  "confirmation",
  "reminder",
  "reschedule",
  "thank_you",
] as const;

export type MessageTemplateType = (typeof MESSAGE_TEMPLATE_TYPES)[number];

export const MESSAGE_TEMPLATE_LABELS: Record<MessageTemplateType, string> = {
  confirmation: "Confirmacion",
  reminder: "Recordatorio",
  reschedule: "Reprogramacion",
  thank_you: "Agradecimiento",
};

type DefaultTemplate = {
  body: string;
  title: string;
};

export const DEFAULT_MESSAGE_TEMPLATES: Record<MessageTemplateType, DefaultTemplate> = {
  confirmation: {
    title: "Confirmacion de cita",
    body: "Hola {cliente}, te confirmamos tu cita de {servicio} el {fecha} a las {hora} en {negocio}.",
  },
  reminder: {
    title: "Recordatorio de cita",
    body: "Hola {cliente}, te recordamos tu cita de {servicio} hoy {fecha} a las {hora} en {negocio}.",
  },
  reschedule: {
    title: "Reprogramacion de cita",
    body: "Hola {cliente}, desde {negocio} queremos reprogramar tu cita de {servicio} del {fecha} a las {hora}.",
  },
  thank_you: {
    title: "Agradecimiento",
    body: "Gracias {cliente} por visitarnos en {negocio}. Fue un gusto atenderte en {servicio}.",
  },
};

export type MessageTemplateVariables = {
  cliente: string;
  fecha: string;
  hora: string;
  negocio: string;
  precio: string;
  servicio: string;
};

export function isMessageTemplateType(value: string): value is MessageTemplateType {
  return MESSAGE_TEMPLATE_TYPES.includes(value as MessageTemplateType);
}

export function renderMessageTemplate(
  templateBody: string,
  variables: MessageTemplateVariables,
) {
  return templateBody.replace(/\{(cliente|negocio|servicio|fecha|hora|precio)\}/gi, (match, key) => {
    const normalizedKey = key.toLowerCase() as keyof MessageTemplateVariables;
    return variables[normalizedKey] ?? match;
  });
}
