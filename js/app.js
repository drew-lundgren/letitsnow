// app.js


// try this out for a progress bar
// http://bl.ocks.org/mbostock/3750941
// this might be easier:
// http://www.competa.com/blog/2015/10/animated-progress-bars-with-d3-js/

// js-hint modifiers
/*globals d3, L */

window.onload = function()
{
    main();
};

function main()
{
    var data,
        map =
        // setup leaflet map
        _setupMap();

    // query weather service for latest weather data
    _getData(function(result)
    {
        // parse data and return records array
        data = _parse(result);
        // once data is available start dropping points
        _addData2Map(map, data);
        console.log(data, map);
    });
}

// add weather data to map
// brefs:
// https://gist.github.com/d3noob/9267535
// http://bost.ocks.org/mike/leaflet/
function _addData2Map(map, weatherData)
{
    /* Add a LatLng object to each item in the dataset */
    weatherData.forEach( function(d)
    {
        d.LatLng = new L.LatLng(
            d.coords[0],
            d.coords[1]
        );
    });
    /* Initialize the SVG layer */
    map._initPathRoot();
    /* We simply pick up the SVG from the map object */
    var svg = d3.select("#map").select("svg"),

        color = d3.scale.linear()
            .domain(_getValueRange(weatherData))
            .range(["#8A9599", "#F200FF"])
            .interpolate(d3.interpolateHcl),

        // add group container - holds circel and text
        group = svg.selectAll("g")
            .data(weatherData),

        // add to group
        groupEnter = group.enter()
            .append('g')
            .attr("transform", _leaf2D3),

        // add circles to group
        circle = groupEnter.append('circle')
            .style("stroke", "black")
            // .style("opacity", .6)
            // color by value
            .style("fill",
                function(d) {
                    return color(d.value);
                })
            .attr("r", 20),

        // add text to group
        text = groupEnter.append('text')
            .attr('dx', -8)
            .attr('dy', 5)
            // label feature with snowfall amount
            .text( function(d) {
                return d.value;
            });

    // update coordinates when map moves
    map.on("viewreset", _update);
    _update();


    ///////////////////////////////////////
    // MAPPING FUNCTIONS

    function _getValueRange(data) {
        return d3.extent(data, function(d) {
            return d.value;
        });
    }

    function _update()
    {
        group.attr("transform", _leaf2D3);
    }

    function _leaf2D3(d) {
        {
            return "translate(" +
                map.latLngToLayerPoint(d.LatLng).x + "," +
                map.latLngToLayerPoint(d.LatLng).y + ")";
        }
    }

    console.log('done');


}

// setup leaflet map
// return map object
function _setupMap()
{
    var map = L.map('map').setView([46.782963, -92.094666], 7),
        MapQuestOpen_Aerial = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
        {
            type: 'sat',
            ext: 'jpg',
            attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
            subdomains: '1234'
        }).addTo(map);
    return map;
}

// GET request to weather service
function _getData(callback)
{
    var request = new XMLHttpRequest();
    request.open('GET', 'http://cors-anywhere.herokuapp.com/nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public', true);

    request.onload = function()
    {
        if (request.status >= 200 && request.status < 400)
        {
            // Success!
            callback(request.responseText);
        }
        else
        {
            // We reached our target server, but it returned an error
            console.log('server error', request);
        }
    };

    request.onerror = function()
    {
        // There was a connection error of some sort
        console.log('error', request);
    };

    request.send();
}

// parse raw data into useable records
function _parse(raw)
{
    //  console.log(raw.indexOf('\n'));
    //var re = /(..REMARKS..[^]*?&&)/,
    //  matches = raw.match(re);
    var regexs = {
            latLng: /\d{2}\.\d{2}[N]\s\d{2}\.\d{2}[W]/,
            value: /\d{1,2}\.\d{1,2}(?=\sINCH)/,
            date: /\d{2}\/\d{2}\/\d{4}/,
            time: /(\d{4}\s(AM|PM))/,
            lines: /\n/
        },
        records = [],
        data = {},
        lines = raw.split(regexs.lines),
        matches = [];

    lines.forEach(function(line, index, array)
    {
        var match = '';
        // check for snow
        if (line.indexOf('SNOW') === 12)
        {
            // check where next time is
            if (regexs.time.test(array[index + 3]))
            {
                match = array.slice(index, index + 3).join(' ');
            }
            else if (regexs.time.test(array[index + 5]))
            {
                match = array.slice(index, index + 5).join(' ');
            }
        }
        if (match) matches.push(match);
    });

    // console.log(regexs);
    // console.log('matches', matches);

    // loop through rows
    matches.forEach(function(row)
    {
        // exit if it's not a weather snippet
        // if (row.substr(2, 3) != '000') {
        //     return false;
        // }
        // set the date
        var theDate = new Date(row.match(regexs.date)[0]),
            theTime = row.match(regexs.time)[0],
            hours12 = parseInt(theTime.substr(0, 2)),
            hours24 = theTime.substr(-2) == 'AM' ? hours12 : hours12 + 12,

            // get lat long
            dirLatLng = row.match(regexs.latLng)[0],
            // convert from directional to hemispheric
            leafLatLng = dirLatLng.split(' ').map(function(latLng)
            {
                if (latLng.substr(-1) == 'N' || latLng.substr(-1) == 'E')
                {
                    return latLng.slice(0, 5) * 1;
                }
                else
                {
                    return latLng.slice(0, 5) * -1;
                }
            });
        // set the time
        theDate.setHours(hours24);
        theDate.setMinutes(theTime.substr(2, 2));

        // populate data
        data = {
            coords: leafLatLng,
            value: parseFloat(row.match(regexs.value)[0]),
            datetime: theDate
        };


        records.push(data);
    });

    // console.log('records', records);
    return records;
}
