### Functional Tests -- a suite of selenium-powered tests, to prevent regressions as we improve our SirsiDynex Enterprise view.

  - in a python3 environment with selenium, pytest, and geckodriver:
  - ```cd ./FunctionalTests```
  - ```pytest```
  - this will open a long sequence of browser windows (each without cache).  I figure the benefit is worth the cost.  Although it takes forever, you get the assurance that your browser cache isn't affecting any of the results.  
  - the only things tested are javascript or searchboxes that we at LSU coded.  Anything coming from LOUIS or Sirsi is assumed to be perfect.
  - you can test the production site (or the staging site) by changing the url in the ./FunctionalTests/test\*.py files
  - the tests will break occasionally due to the search index changing (this is ugly), but we need to test that the searchboxes work.  Some tests send in a search query & test whether the results page contains a particular item.  I don't know a better way to test a searchbox at the moment.  We'll have to update the tests whenever they break due to a solr index change.

### our_files -- our institution's versions of Enterprise files.

  - these are manually synced from the Louis sftp site.  Mainly it's the custom.js and custom_dev.js files that we often change.  Enterprise doesn't do version control, so this is a hack to accomplish version control.  I literally copy the contents of custom.js back & forth from the Enterprise server, and git commit them in this repo.

### related_files -- code we added to our Drupal instance, pointing to Enterprise features
