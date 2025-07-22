/**
 * WorkoutFile Fixtures
 * Factory pattern fixtures for creating WorkoutFile value objects using rosie and faker
 *
 * This fixture demonstrates:
 * - Separate builders for complex content structures
 * - Proper use of domain factory functions
 * - Reusable builders for different file formats
 * - Dependencies between file properties
 */

import type { WorkoutFile } from '@/domain';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

/**
 * TCX Content Builder
 * Creates TCX XML content for workout files
 * Demonstrates complex structure creation with proper builder separation
 */
export const tcxContentBuilder = new Factory()
  .attr('activityId', () => faker.date.recent().toISOString())
  .attr('sport', () =>
    faker.helpers.arrayElement(['Running', 'Biking', 'Swimming'])
  )
  .attr('startTime', () => faker.date.recent().toISOString())
  .attr('duration', () => faker.number.int({ min: 600, max: 7200 }))
  .attr('distance', () => faker.number.int({ min: 1000, max: 50000 }))
  .option('sport', 'Running')
  .option('includeTrackpoints', true)
  .option('trackpointCount', 10)
  .after((content, options) => {
    const trackpoints = options.includeTrackpoints
      ? generateTrackpoints(options.trackpointCount, content.duration)
      : '';

    return `<?xml version="1.0"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="${options.sport || content.sport}">
      <Id>${content.activityId}</Id>
      <Lap StartTime="${content.startTime}">
        <TotalTimeSeconds>${content.duration}</TotalTimeSeconds>
        <DistanceMeters>${content.distance}</DistanceMeters>
        <Track>
          ${trackpoints}
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
  });

/**
 * GPX Content Builder
 * Creates GPX XML content for workout files
 */
export const gpxContentBuilder = new Factory()
  .attr('activityId', () => faker.date.recent().toISOString())
  .attr('startTime', () => faker.date.recent().toISOString())
  .attr('duration', () => faker.number.int({ min: 600, max: 7200 }))
  .attr('distance', () => faker.number.int({ min: 1000, max: 50000 }))
  .option('includeTrackpoints', true)
  .option('trackpointCount', 10)
  .after((content, options) => {
    const trackpoints = options.includeTrackpoints
      ? generateGpxTrackpoints(options.trackpointCount, content.duration)
      : '';

    return `<?xml version="1.0"?>
<gpx version="1.1" creator="TrainingPeaks SDK" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <time>${content.startTime}</time>
  </metadata>
  <trk>
    <name>Workout ${content.activityId}</name>
    <trkseg>
      ${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
  });

/**
 * FIT Content Builder
 * Creates binary FIT content for workout files
 * Demonstrates lazy evaluation for heavy structures
 */
export const fitContentBuilder = new Factory()
  .attr('activityId', () => faker.date.recent().toISOString())
  .attr('duration', () => faker.number.int({ min: 600, max: 7200 }))
  .attr('distance', () => faker.number.int({ min: 1000, max: 50000 }))
  .option('includeHeartRate', true)
  .option('includePower', false)
  .option('includeGPS', true)
  .after((content, options) => {
    // Simulate FIT binary content (in real implementation, this would generate actual FIT data)
    const fitData = {
      header: {
        protocolVersion: 20,
        profileVersion: 1008,
        dataSize: 0,
        dataType: '.FIT',
      },
      activity: {
        timestamp: content.activityId,
        totalTimerTime: content.duration,
        totalDistance: content.distance,
        includeHeartRate: options.includeHeartRate,
        includePower: options.includePower,
        includeGPS: options.includeGPS,
      },
    };

    // Convert to binary-like string for testing
    return Buffer.from(JSON.stringify(fitData)).toString('base64');
  });

/**
 * WorkoutFile Builder
 * Creates WorkoutFile value objects with proper content dependencies
 */
export const workoutFileBuilder = new Factory<WorkoutFile>()
  .attr('fileName', () => `${faker.lorem.word()}.tcx`)
  .attr('content', () => tcxContentBuilder.build())
  .attr('mimeType', () => 'application/tcx+xml')
  .option('fileFormat', 'tcx')
  .option('includeTrackpoints', true)
  .option('trackpointCount', 10)
  .after((file, options) => {
    let content: string;
    let mimeType: string;

    switch (options.fileFormat) {
      case 'gpx':
        content = gpxContentBuilder.build({
          includeTrackpoints: options.includeTrackpoints,
          trackpointCount: options.trackpointCount,
        });
        mimeType = 'application/gpx+xml';
        break;
      case 'fit':
        content = fitContentBuilder.build({
          includeHeartRate: options.includeHeartRate,
          includePower: options.includePower,
          includeGPS: options.includeGPS,
        });
        mimeType = 'application/octet-stream';
        break;
      case 'tcx':
      default:
        content = tcxContentBuilder.build({
          sport: options.sport,
          includeTrackpoints: options.includeTrackpoints,
          trackpointCount: options.trackpointCount,
        });
        mimeType = 'application/tcx+xml';
        break;
    }

    return {
      fileName: file.fileName.replace(
        /\.[^.]+$/,
        `.${options.fileFormat || 'tcx'}`
      ),
      content,
      mimeType,
    };
  });

/**
 * Predefined File Builders for Common Formats
 * These demonstrate reusable builders for common file types
 */

/**
 * TCX WorkoutFile Builder
 * Creates TCX format workout files
 */
export const tcxWorkoutFileBuilder = new Factory()
  .extend(workoutFileBuilder)
  .option('fileFormat', 'tcx')
  .option('sport', 'Running')
  .option('includeTrackpoints', true);

/**
 * GPX WorkoutFile Builder
 * Creates GPX format workout files
 */
export const gpxWorkoutFileBuilder = new Factory()
  .extend(workoutFileBuilder)
  .option('fileFormat', 'gpx')
  .option('includeTrackpoints', true);

/**
 * FIT WorkoutFile Builder
 * Creates FIT format workout files
 */
export const fitWorkoutFileBuilder = new Factory()
  .extend(workoutFileBuilder)
  .option('fileFormat', 'fit')
  .option('includeHeartRate', true)
  .option('includePower', false)
  .option('includeGPS', true);

/**
 * Helper Functions for Trackpoint Generation
 * These are kept as helper functions since they generate simple data structures
 * and are used by multiple builders
 */

function generateTrackpoints(count: number, totalDuration: number): string {
  const points = [];
  const interval = totalDuration / count;

  for (let i = 0; i < count; i++) {
    const time = i * interval;
    const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
    const lon = -74.006 + (Math.random() - 0.5) * 0.01;
    const altitude = 10 + Math.random() * 100;
    const heartRate = 120 + Math.random() * 60;

    points.push(`<Trackpoint>
        <Time>${new Date(Date.now() + time * 1000).toISOString()}</Time>
        <Position>
          <LatitudeDegrees>${lat.toFixed(6)}</LatitudeDegrees>
          <LongitudeDegrees>${lon.toFixed(6)}</LongitudeDegrees>
        </Position>
        <AltitudeMeters>${altitude.toFixed(1)}</AltitudeMeters>
        <HeartRateBpm>
          <Value>${Math.round(heartRate)}</Value>
        </HeartRateBpm>
      </Trackpoint>`);
  }

  return points.join('\n          ');
}

function generateGpxTrackpoints(count: number, totalDuration: number): string {
  const points = [];
  const interval = totalDuration / count;

  for (let i = 0; i < count; i++) {
    const time = i * interval;
    const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
    const lon = -74.006 + (Math.random() - 0.5) * 0.01;
    const elevation = 10 + Math.random() * 100;

    points.push(`<trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}">
        <ele>${elevation.toFixed(1)}</ele>
        <time>${new Date(Date.now() + time * 1000).toISOString()}</time>
      </trkpt>`);
  }

  return points.join('\n      ');
}
