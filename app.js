$.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
        options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
        //options.url = "http://cors.corsproxy.io/url=" + options.url;
    }
});

var raw;

$.get("http://www.nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public")
    .done(
        function(data) {
            parse(data);
        });



function parse(raw) {
    //  console.log(raw.indexOf('\n'));
    //var re = /(..REMARKS..[^]*?&&)/,
    //  matches = raw.match(re);
    var regexs = {
            latLng: /\d{2}\.\d{2}[N]\s\d{2}\.\d{2}[W]/,
            value: /\d{1,2}\.\d{1,2}(?=\sINCH)/
        },
        records = [],
        data = {},
        matches = raw.split('<hr>');

    console.log(regexs);
    //console.log('matches', matches);

    // loop through rows
    matches.forEach( function(row) {
        // exit if it's not a weather snippet
        if (row.substr(1, 3) != 'pre') {
            return false;
        }
        // populate data
        data = {
            latLng: row.match(regexs.latLng)[0],
            value: row.match(regexs.value)[0]
        };


        records.push(data);
    });

    //console.log('records', records);
}
