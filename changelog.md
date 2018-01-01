# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

------------------------------------------------------------------------------

## [1.0.4] - 2018-01-01

### Fixed 
 - docs, path option property was moved into address config hash
 - minor fixes..

------------------------------------------------------------------------------

## [1.0.3] - 2017-12-30

### Fixed 
 - Pass the configuration object/hash to the net.Socket super constructor
 - minor fixes..

### Added
 - Example for infinite loop with #hunt and #watch Promises

### Changed
 - #hunt #watch #prey Promise receives always an array. When the Promise
   is rejected, the Array contains all the errors collected along the chain.

------------------------------------------------------------------------------

## [1.0.2] - 2017-12-30

### Fixed 
 - bug with offline event (#hunt) 
 - better output for examples

------------------------------------------------------------------------------

## [1.0.0] - 2017-12-29

### Added
 - added #hunt #die #prey #watch methods (native Promises)
 - drop support for node versions <= v6.0.0

### Changed
 - moved options.path to options.address.path
 
------------------------------------------------------------------------------
