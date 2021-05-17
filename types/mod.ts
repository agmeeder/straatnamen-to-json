export interface KeyValueObject {
  [key: string]: string
}

export interface Street {
  nid: number;
  created: Date;
  changed: Date;
  district: string;
  longitude: number;
  latitude: number;
  date: Date;
  import_x: number;
  import_y: number;
  title: string;
  intro: string;
  body: string;
  benoemingsbesluit: string;
  periode: string;
}

declare global {
  interface String {
    insert(text: string, position: number): string;
  }
}

String.prototype.insert = function(text: string, position: number) {
  return String(this).substring(0, position) + text + String(this).substring(position)
}