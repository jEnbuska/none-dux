const types = {};
export const subjects = [ 'A_A',, 'A_B', 'B', 'C', 'D', 'E_A', 'E_B', ];
export const triggers = [ 'ADD_', 'REMOVE_', 'UPDATE_', 'RESET_', ];

subjects.forEach(s => {
  triggers.forEach(t => {
    types[t + s] = t+s;
  });
});

export default types;