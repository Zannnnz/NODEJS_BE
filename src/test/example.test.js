import{expect} from 'chai'
describe('Math operation',() => {
   // trong đây sẽ chứa tất cả các test case của bộ test này
   it('should at two interger',() => {
     const result =10 + 10 ;
     // sử dụng lib chai để mock kết quả trả về từ function hoặc biến
      expect(result).to.equal(20);
   });
   it("testing arr",() => {
      const arr =[1,2,3];
      expect(arr).to.include(2,3);
    });
})
