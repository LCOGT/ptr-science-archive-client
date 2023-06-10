import _ from 'lodash';

export { itemInList, removeItemFromList };

function itemInList(list, item) {
  return _.includes(list, item);
}

function removeItemFromList(list, item) {
  list = list.filter(function(value) {
    return value != item;
  });
  return list;
}
