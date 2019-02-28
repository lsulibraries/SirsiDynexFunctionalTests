Functional Tests -- a suite of selenium-powered tests, to prevent regressions while improving our SirsiDynex Enterprise view.

Small Projects -- some unrelated scripts

our_files -- our institution's versions of Enterprise files

related_files -- some code we added to our Drupal instance, that points to Enterprise features

MarcmapsSearchfieldsToJson -- a script for extracting your institution's Enterprise settings.  These require an admin login/password (not retained), so a non-admin cannot use this.

    Setup a python venv in anaconda (Windows) or a *nix.
    pip install requests
    pip install bs4
    pip install lxml (usually requires prequesite installs, so install whatever it reports missing then try to install lxml again)
    change the ROOT_URL in scrape_Enterprise_searchconfig_marcmaps.py to match your institution's Enterprise admin page.
    from the folder MarcmapsSearchfieldsToJson/ run:
        python scrape_Enterprise_searchconfig_marcmaps.py
    look for two new .json files in this directory after completion.
