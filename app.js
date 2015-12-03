$.ajaxPrefilter( function (options) {
  if (options.crossDomain && jQuery.support.cors) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    //options.url = "http://cors.corsproxy.io/url=" + options.url;
  }
});

$.get( "http://www.nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public#LSRDLH")
.done(
function( data ) {
    console.log(data);
});
