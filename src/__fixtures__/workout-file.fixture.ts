/**
 * WorkoutFile Fixtures
 * Provides test data for the WorkoutFile value object
 */

import { faker } from '@faker-js/faker';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { randomNumber, randomString } from './utils.fixture';

/**
 * WorkoutFile Fixture
 */
export class WorkoutFileFixture {
  private workoutFile: Partial<{
    fileName: string;
    content: string;
    mimeType: string;
  }> = {};

  withFileName(fileName: string): this {
    this.workoutFile.fileName = fileName;
    return this;
  }

  withRandomFileName(): this {
    const extensions = ['.tcx', '.gpx', '.fit', '.xml'];
    const extension = faker.helpers.arrayElement(extensions);
    this.workoutFile.fileName = `${faker.lorem.word()}${extension}`;
    return this;
  }

  withTcxFileName(): this {
    this.workoutFile.fileName = `${faker.lorem.word()}.tcx`;
    return this;
  }

  withGpxFileName(): this {
    this.workoutFile.fileName = `${faker.lorem.word()}.gpx`;
    return this;
  }

  withFitFileName(): this {
    this.workoutFile.fileName = `${faker.lorem.word()}.fit`;
    return this;
  }

  withXmlFileName(): this {
    this.workoutFile.fileName = `${faker.lorem.word()}.xml`;
    return this;
  }

  withLongFileName(): this {
    // Create a name exactly at the limit (255 characters)
    const longName = 'a'.repeat(251); // 251 + '.tcx' = 255
    this.workoutFile.fileName = `${longName}.tcx`;
    return this;
  }

  withTooLongFileName(): this {
    // Create a name that exceeds the limit
    const longName = 'a'.repeat(252); // 252 + '.tcx' = 256
    this.workoutFile.fileName = `${longName}.tcx`;
    return this;
  }

  withContent(content: string): this {
    this.workoutFile.content = content;
    return this;
  }

  withRandomContent(): this {
    this.workoutFile.content = faker.lorem.paragraphs(randomNumber(3, 10));
    return this;
  }

  withTcxContent(): this {
    this.workoutFile.content = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase 
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd"
  xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1"
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"
  xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2"
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Activities>
    <Activity Sport="Running">
      <Id>2024-01-15T10:00:00.000Z</Id>
      <Lap StartTime="2024-01-15T10:00:00.000Z">
        <TotalTimeSeconds>1800.0</TotalTimeSeconds>
        <DistanceMeters>5000.0</DistanceMeters>
        <Calories>300</Calories>
        <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm>
        <MaximumHeartRateBpm><Value>170</Value></MaximumHeartRateBpm>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
    return this;
  }

  withGpxContent(): this {
    this.workoutFile.content = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test Creator" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <time>2024-01-15T10:00:00Z</time>
  </metadata>
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="40.7128" lon="-74.0060">
        <ele>10.0</ele>
        <time>2024-01-15T10:00:00Z</time>
      </trkpt>
      <trkpt lat="40.7129" lon="-74.0061">
        <ele>11.0</ele>
        <time>2024-01-15T10:00:01Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;
    return this;
  }

  withFitContent(): this {
    // FIT files are binary, but for testing we'll use a placeholder
    this.workoutFile.content = 'FIT_BINARY_DATA_PLACEHOLDER';
    return this;
  }

  withEmptyContent(): this {
    this.workoutFile.content = '';
    return this;
  }

  withWhitespaceContent(): this {
    this.workoutFile.content = '   \n\t   ';
    return this;
  }

  withLargeContent(): this {
    // Create content just under the 10MB limit
    const sizeInMB = 9; // 9MB
    const contentSize = sizeInMB * 1024 * 1024;
    this.workoutFile.content = 'x'.repeat(contentSize);
    return this;
  }

  withTooLargeContent(): this {
    // Create content that exceeds the 10MB limit
    const sizeInMB = 11; // 11MB
    const contentSize = sizeInMB * 1024 * 1024;
    this.workoutFile.content = 'x'.repeat(contentSize);
    return this;
  }

  withMimeType(mimeType: string): this {
    this.workoutFile.mimeType = mimeType;
    return this;
  }

  withRandomMimeType(): this {
    const validMimeTypes = [
      'application/gpx+xml',
      'application/tcx+xml',
      'application/fit',
      'text/csv',
      'application/json',
    ];
    this.workoutFile.mimeType = faker.helpers.arrayElement(validMimeTypes);
    return this;
  }

  withTcxMimeType(): this {
    this.workoutFile.mimeType = 'application/tcx+xml';
    return this;
  }

  withGpxMimeType(): this {
    this.workoutFile.mimeType = 'application/gpx+xml';
    return this;
  }

  withFitMimeType(): this {
    this.workoutFile.mimeType = 'application/fit';
    return this;
  }

  withCsvMimeType(): this {
    this.workoutFile.mimeType = 'text/csv';
    return this;
  }

  withJsonMimeType(): this {
    this.workoutFile.mimeType = 'application/json';
    return this;
  }

  withInvalidMimeType(): this {
    this.workoutFile.mimeType = 'application/invalid';
    return this;
  }

  withEmptyMimeType(): this {
    this.workoutFile.mimeType = '';
    return this;
  }

  build(): WorkoutFile {
    return WorkoutFile.create(
      this.workoutFile.fileName || 'workout.tcx',
      this.workoutFile.content || this.getDefaultTcxContent(),
      this.workoutFile.mimeType || 'application/tcx+xml'
    );
  }

  buildFromBuffer(): WorkoutFile {
    const content = this.workoutFile.content || this.getDefaultTcxContent();
    const buffer = Buffer.from(content, 'utf8');
    return WorkoutFile.fromBuffer(
      this.workoutFile.fileName || 'workout.tcx',
      buffer,
      this.workoutFile.mimeType || 'application/tcx+xml'
    );
  }

  private getDefaultTcxContent(): string {
    return `<?xml version="1.0"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>2024-01-15T10:00:00.000Z</Id>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
  }

  /**
   * Static factory methods
   */
  static default(): WorkoutFile {
    return new WorkoutFileFixture().build();
  }

  static random(): WorkoutFile {
    return new WorkoutFileFixture()
      .withRandomFileName()
      .withRandomContent()
      .withRandomMimeType()
      .build();
  }

  static tcxFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withTcxFileName()
      .withTcxContent()
      .withTcxMimeType()
      .build();
  }

  static gpxFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withGpxFileName()
      .withGpxContent()
      .withGpxMimeType()
      .build();
  }

  static fitFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withFitFileName()
      .withFitContent()
      .withFitMimeType()
      .build();
  }

  static csvFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withFileName('workout.xml') // Use .xml extension since .csv is not allowed
      .withContent('time,distance,heartrate\n0,0,120\n60,100,150')
      .withCsvMimeType()
      .build();
  }

  static jsonFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withFileName('workout.xml') // Use .xml extension since .json is not allowed
      .withContent('{"type":"workout","duration":3600,"distance":10000}')
      .withJsonMimeType()
      .build();
  }

  static largeFile(): WorkoutFile {
    return new WorkoutFileFixture()
      .withTcxFileName()
      .withLargeContent()
      .withTcxMimeType()
      .build();
  }
}