// CSV parsing utilities for importing data

export const parsePersonsCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  // Expected headers: name, phone, note, photo
  const persons = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 1 && values[0]) {
      const person = {
        id: `person_${Date.now()}_${i}`,
        name: values[0] || '',
        phone: values[1] || '',
        note: values[2] || '',
        photo: values[3] || '',
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      };
      persons.push(person);
    }
  }

  return persons;
};

export const parseRelationsCSV = (csvText, persons) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  // Expected headers: from_name, to_name, label, note
  const relations = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 3 && values[0] && values[1] && values[2]) {
      const fromPerson = persons.find(p => p.name === values[0]);
      const toPerson = persons.find(p => p.name === values[1]);

      if (fromPerson && toPerson) {
        const relation = {
          id: `relation_${Date.now()}_${i}`,
          from: fromPerson.id,
          to: toPerson.id,
          label: values[2] || '',
          note: values[3] || ''
        };
        relations.push(relation);
      }
    }
  }

  return relations;
};

export const exportPersonsToCSV = (persons) => {
  const headers = ['name', 'phone', 'note', 'photo'];
  const rows = persons.map(person => [
    person.name || '',
    person.phone || '',
    person.note || '',
    person.photo || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const exportRelationsToCSV = (relations, persons) => {
  const headers = ['from_name', 'to_name', 'label', 'note'];
  const rows = relations.map(relation => {
    const fromPerson = persons.find(p => p.id === relation.from);
    const toPerson = persons.find(p => p.id === relation.to);

    return [
      fromPerson?.name || '',
      toPerson?.name || '',
      relation.label || '',
      relation.note || ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};