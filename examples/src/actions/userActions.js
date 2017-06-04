import uuidV4 from 'uuid/v4';

export function upsertHoliday({ id, name, start, end, }) {
  return function ({ holidays, }) {
    if (id) {
      holidays[id].setState({ name, start, end, });
    } else {
      id = uuidV4();
      holidays.setState({ [id]: { id, name, start, end, }, });
    }
  };
}

export function removeHoliday(id) {
  return function ({ holidays, }) {
    holidays.remove(id);
  };
}