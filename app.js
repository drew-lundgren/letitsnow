$.ajaxPrefilter(function (options) {
  if (options.crossDomain && jQuery.support.cors) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    //options.url = "http://cors.corsproxy.io/url=" + options.url;
  }
});

var raw;

$.get("http://www.nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public#LSRDLH")
  .done(
    function (data) {
      raw = data
      //console.log(raw);
      parse(raw);
    });



function parse(raw) {
//  console.log(raw.indexOf('\n'));
  var re = /(\d{4}\s[A-Z]{2})/m;
  var sections = raw.split("<pre>"),
      lines;
  //console.log(sections);
  sections.forEach( function(section) {
    lines = section.split('\n');
    var tabs;
    lines.forEach( function(line) {
      spaces = line.split(/\s/).filter( function(space) {
        return space != "";
      });
      console.log(spaces);
    });
  });
}
