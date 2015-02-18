# Newsspec-9501

[NHS Winter Tracker 2014-15](http://www.bbc.co.uk/nhswinter)
An data driven interactive created to provide insight and context to the debate around pressures in emergency care provision by the NHS during winter months. The data is obtained from various NHS bodies including NHS England (see data sources section). The dataset is updated weekly.
Users use a postcode search facility which returns their nearest major A&E department in England and they will be able to see it compared against other A&E on a number of variables including England Averages.

## Data sources
England dataset

* A&E Waiting Times and Activity (http://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/) [2014-2015 dataset](http://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/weekly-ae-sitreps-2014-15/)
* Winter Pressures Daily Situation Reports (http://www.england.nhs.uk/statistics/statistical-work-areas/winter-daily-sitreps/) [2014-2015 dataset](http://www.england.nhs.uk/statistics/statistical-work-areas/winter-daily-sitreps/winter-daily-sitrep-2014-15-data/)

Northern Ireland dataset
Scotland dataset
Wales dataset

## Updating data for a given week
### Pre-requisits
Make sure you have [R](http://www.r-project.org/) installed. For instructions please see [R-project cran](http://www.r-project.org/). 

You will also need the following R modules installed
* XLConnect

To install an R module run, the following command in your terminal
```
install.packages("package-name")
```

If you are inside of the reith network, you will need to tell set reith proxies for your R session. In your root folder (i.e. /Users/<username>) add the following to your .Renviron file
```
http_proxy=http://www-cache.reith.bbc.co.uk:80
```

Note: you will have to restart your R-session for R to pick up or drop this setting.

## Run an update
Update the data config object (./source/data)
```json
{
    "weekIndex": 14,
    "data": {
        "week14": {
            // A&E Attendances and Emergency Admissions dataset url
            "weeklyAeSitrepDataUrl": "http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/04/2015.02.08-AE0RgAD.xls",
            // Winter Daily SitRep dataset url
            "winterPressuresDataUrl": "http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-08.02.15.xlsx",
            // week ending dates i.e. 2-8 Feb, 29 Jan - 5 Feb
            "barchartsDates": "2-8 Feb",
            // Patients seen in 4 hours at major A&E hospitals
            "patientsSeenIn4HrsMajorAE": "89.1%",
            // one of [up, down, no-change]
            "dirPatientsSeenIn4HrsMajorAE": "up",
            // Patients seen in 4 hours at all A&E units
            "patientsSeenIn4HrsAllAE": "92.9%",
            // one of [up, down, no-change]
            "dirPatientsSeenIn4HrsAllAE": "up",
            // id of trust to exclude from week's dataset
            "excludedFromPerformanceChart": []
        },
        "week13": {
            // ...
        },
        ...
    }
}
```

In your terminal run 
```
php datacompiler.php
```

Note: Again if you are inside of the reith network you will need to make sure reith proxies are set as you will be getting the data via http.

### datacompiler.php
Sets the week index and data source urls and executes dataextract.R script which retrieves dataset from given urls and creates a json object of relevant variables. PHP script then reads this json object and create a new json datafile to be used by the tracker

## JS Updates
The graphs on the results page have dates showing when the tracker began and the date of the current week. 

```
WINTER_PRESSURES_START_DATE = "(3-9 Nov)",
AEWEEKLY_SITREPS_START_DATE = "(3-9 Nov)",
WINTER_PRESSURES_END_DATE = "(29 Dec - 4 Jan)",
AEWEEKLY_SITREPS_END_DATE = "(29 Dec - 4 Jan)";
```

## Getting started

Set up the project

```
grunt
```

Make images responsive

```
grunt images
```

Build World Service version

```
grunt translate
```

## iFrame scaffold

This project was built using the iFrame scaffold v1.5.7

## License
Copyright (c) 2014 BBC