# comparing how the NHS performed in the last 4 weeks compared to the same time last year
# for delayed transfer of care, ambulances queuing and cancelled operations

setwd('~/Sites/bbc/news/special/2014/newsspec_9501/source/data')
library(XLConnect)
library(reshape2)

previousYearFiles <- c(
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2013/11/DailySR-Web-file-WE-11.12.13.xls',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2013/11/DailySR-Web-file-WE-18.12.13.xls',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2013/11/DailySR-Web-file-WE-01.01.14.xls',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2013/11/DailySR-Web-file-WE-08.01.14.xls'
    )

ambulances <- data.frame()
dtoc <- data.frame()
operations <- data.frame()

dataIndex <- 1
for (filename in previousYearFiles) {
    download.file(filename, destfile='./spreadsheet')
    workbook <- loadWorkbook('./spreadsheet')
    
    if (dataIndex == 1) {
        dropColumns <- c(1,2,3,4,5,6)
        keepOpsColumns <- c(13,16,19)
    } else if (dataIndex == 4) {
        dropColumns <- c(1,2,3,4,7,8,9)
        keepOpsColumns <- c(7,10)
    } else {
        dropColumns <- c(1:4)
        if (dataIndex == 3) {
            keepOpsColumns <- c(7,10,13,16,19,22,25)
        } else {
            keepOpsColumns <- c(7,10,13,16,19)
        }
    }
    
    
    datasetamb <- readWorksheet(workbook, sheet='Ambulances queuing', startRow=15, endRow=16, drop=dropColumns)
    ambulances <- rbind(ambulances, melt(datasetamb))
    
    datasetdtoc <- readWorksheet(workbook, sheet='Delayed transfers of care', startRow=15, endRow=16, drop=dropColumns)
    dtoc <- rbind(dtoc, melt(datasetdtoc))
    
    datasetops <- readWorksheet(workbook, sheet='Cancelled operations', startRow=15, endRow=16, keep=keepOpsColumns)
    operations <- rbind(operations, melt(datasetops))
#     print(datasetops)
    
    dataIndex <- dataIndex + 1
}

ambulances$value <- as.numeric(ambulances$value)
dtoc$value <- as.numeric(dtoc$value)
operations$value <- as.numeric(operations$value)
print(sum(ambulances$value))
print(sum(dtoc$value))
print(sum(operations$value))


currentYearFiles <- c(
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-14.12.14.xlsx',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-21.12.14.xlsx',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-28.12.14.xlsx',
    'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-04.01.15.xlsx'
)

ambulances <- data.frame()
dtoc <- data.frame()
operations <- data.frame()

dataIndex <- 1
for (filename in currentYearFiles) {
    download.file(filename, destfile='./spreadsheet')
    workbook <- loadWorkbook('./spreadsheet')
    
    if (dataIndex %in% c(1,2)) {
        keepOpsColumns <- c(7,10,13,16,19)
    } else if (dataIndex == 4) {
        keepOpsColumns <- c(7,10, 13, 16)
    } else {
        keepOpsColumns <- c(7,10,13)
    }
    
    datasetamb <- readWorksheet(workbook, sheet='Ambulances queuing', startRow=15, endRow=16, drop=c(1:4))
    ambulances <- rbind(ambulances, melt(datasetamb))
    
    datasetdtoc <- readWorksheet(workbook, sheet='Delayed transfers of care', startRow=15, endRow=16, drop=c(1:4))
    dtoc <- rbind(dtoc, melt(datasetdtoc))
    
    datasetops <- readWorksheet(workbook, sheet='Cancelled operations', startRow=15, endRow=16, keep=keepOpsColumns)
    operations <- rbind(operations, melt(datasetops))
    #     print(datasetops)
    
    dataIndex <- dataIndex + 1
}

ambulances$value <- as.numeric(ambulances$value)
dtoc$value <- as.numeric(dtoc$value)
operations$value <- as.numeric(operations$value)
print(sum(ambulances$value))
print(sum(dtoc$value))
print(sum(operations$value))
