import { join } from 'https://deno.land/std/path/mod.ts'
import { BufReader } from 'https://deno.land/std@0.96.0/io/bufio.ts'
import { parse as csvParse } from 'https://deno.land/std/encoding/csv.ts'
import { parse as dateParse } from 'https://deno.land/std@0.96.0/datetime/mod.ts'

import * as _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js'

import { KeyValueObject, Street } from './types/mod.ts'

async function filterStreets(streetData: Array<KeyValueObject>) {
  return streetData.filter((street) => {
    return street["street_type"].trim().endsWith('Bestaand')
  }).map((street) => {
    return _.pick(street, [
      'nid',
      'created',
      'changed',
      'date',
      'longitude',
      'latitude',
      'district',
      'import_x',
      'import_y',
      'title',
      'intro',
      'body',
      'benoemingsbesluit',
      'period'
    ]) as KeyValueObject
  })
}

async function convertStreets(streetData: Array<KeyValueObject>) {
  const result: Array<Street> = []
  streetData.forEach((street) => {
    const date = street["date"] ? dateParse(street["date"].replace('T00:00:00', ''), 'yyyy-MM-dd') : new Date(1970,1,1)

    const newStreet: Street = {
      nid: Number(street["nid"]),
      created: dateParse(street["created"], 'd-M-yyyy HH:mm'),
      changed: dateParse(street["changed"], 'd-M-yyyy HH:mm'),
      date: date,
      latitude: Number(street["latitude"].replaceAll('.', '').insert('.', 2)),
      longitude: Number(street["longitude"].replaceAll('.', '').insert('.', 1)),
      district: street["district"],
      import_x: Number(street["import_x"]),
      import_y: Number(street["import_y"]),
      title: street["title"],
      intro: street["intro"],
      body: street["body"],
      benoemingsbesluit: street["benoemingsbesluit"],
      periode: street["period"]
    };

    result.push(newStreet)
  })
  return result;
}

async function loadStreetnameData() {
  const path = join('source', 'straatnamen.csv')
  const file = await Deno.open(path)
  try {
    const bufReader = new BufReader(file)
    const result = await csvParse(bufReader, { skipFirstRow: true, separator: ';' })
    return result;
  } finally {
    Deno.close(file.rid)
  }
}

async function saveStreetnameData(streets: Array<Street>) {
  const path = join('output', 'straatnamen.json')
  await Deno.writeTextFile(path, JSON.stringify(streets))
}

const streetData = await loadStreetnameData()
const filteredStreets = await filterStreets(streetData as Array<KeyValueObject>)
const streets = await convertStreets(filteredStreets)
await saveStreetnameData(streets)
console.log(`${streets.length} straten gevonden in het bestand!`)