describe("Geocore utilities", function() {
  
  describe("Common Options", function() {
    it("should produce correct query string", function() {
      var options = new geocore.utils.CommonOptions()
        .setNum(100)
        .setPage(1)
        .setTagNames(['a', 'b', 'c']);
      expect(
        geocore.utils.buildQueryString(options.data()))
        .to.equal("?num=100&page=1&tag_names=a%2Cb%2Cc");
      expect(
        geocore.utils.buildQueryString(
          geocore.utils.mergeOptions(
            {test1 : "baba", test2 : 1},
            options.data())))
        .to.equal("?test1=baba&test2=1&num=100&page=1&tag_names=a%2Cb%2Cc");
    });
  });
  
});
