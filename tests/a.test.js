import { expect, } from 'chai';

function sort(arr){

}

function quicksort(arr, left, right){
  if(left>=right){
    return
  }
  const pivot = arr[(left+right)/2];
  const index = partition(arr, left, right, pivot);
  quicksort(arr, left, index-1);
  quicksort(arr,index,right);
}

function partition(arr, left, right, pivot){
  while(left<=right){
    while(arr[left]<pivot){
      left++;
    }
    while(arr[right]>pivot){
      right--;
    }
    if(left<=right){
      const leftValue = arr[left];
      arr[left] = arr[right];
      arr[right] = leftValue;
      left++;
      right--;
    }
  }
  return left;
}
describe('arrays as state', () => {
  it('sub state should stay as array', () => {
    const arr = [ 1, 2, 1, 42, 1, 5, 1, 425, 7, 6, 42, ];
    console.log(sort(arr))
  });
});
