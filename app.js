document.addEventListener('DOMContentLoaded', function() {
  const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
  const countyUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

  Promise.all([d3.json(educationUrl), d3.json(countyUrl)])
    .then(([educationData, countyData]) => {
      const svg = d3.select('#choropleth');
      const width = 1000;
      const height = 600;

      const path = d3.geoPath();
      const colorScale = d3.scaleThreshold()
        .domain([10, 20, 30, 40])
        .range(d3.schemeBlues[5]);

      svg.attr('width', width)
        .attr('height', height);

      const tooltip = d3.select('#tooltip');

      svg.append('g')
        .selectAll('path')
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter().append('path')
        .attr('class', 'county')
        .attr('data-fips', d => d.id)
        .attr('data-education', d => {
          const result = educationData.find(obj => obj.fips === d.id);
          return result ? result.bachelorsOrHigher : 0;
        })
        .attr('d', path)
        .attr('fill', d => {
          const result = educationData.find(obj => obj.fips === d.id);
          return result ? colorScale(result.bachelorsOrHigher) : colorScale(0);
        })
        .on('mouseover', (event, d) => {
          const result = educationData.find(obj => obj.fips === d.id);
          tooltip.style('display', 'block')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(result ? `${result.area_name}, ${result.state}: ${result.bachelorsOrHigher}%` : 'No data')
            .attr('data-education', result ? result.bachelorsOrHigher : 0);
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });

      const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${width - 600},${height - 40})`);

      const legendWidth = 300;
      const legendHeight = 20;

      const legendScale = d3.scaleLinear()
        .domain([2.6, 75.1])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .tickSize(13)
        .tickValues(colorScale.domain())
        .tickFormat(d => `${d}%`);

      legend.selectAll('rect')
        .data(colorScale.range().map(color => {
          const d = colorScale.invertExtent(color);
          if (!d[0]) d[0] = legendScale.domain()[0];
          if (!d[1]) d[1] = legendScale.domain()[1];
          return d;
        }))
        .enter().append('rect')
        .attr('height', legendHeight)
        .attr('x', d => legendScale(d[0]))
        .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
        .attr('fill', d => colorScale(d[0]));

      legend.append('g')
        .attr('transform', `translate(0,${legendHeight})`)
        .call(legendAxis)
        .select('.domain')
        .remove();
    })
    .catch(error => console.error('Error loading data:', error));
});
