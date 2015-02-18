commandLineArgs <- commandArgs(TRUE)

require(XLConnect)
require(rjson)
require(methods)

# update the following path as it should be on your local machine
setwd(commandLineArgs[3])

# $weekIndex $weeklyAeSitrep $winterPressures
weekIndex <- as.integer(commandLineArgs[1])

weekWorkingDirectory <- paste(getwd(), '/week', weekIndex, sep='')

# process winter pressures dataset
if (weekIndex > 5) {
    winterPressuresDataUrl <- commandLineArgs[2]
#     winterPressuresDataUrl <- 'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Web-file-WE-18.01.15.xlsx'
    columnStartIndex <- 1
} else {
    winterPressuresDataUrl <- 'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/12/DailySR-Timeseries-WE-07.12.14-v2.xlsx'
    columnStartIndex <- weekIndex
}

# # week 6, 8, 9 data file had an update as there was missing data in original source file. NHS England corrected this problem
if (weekIndex %in% c(6,8,9)) {
    winterPressuresWorkbook <- loadWorkbook(winterPressuresDataUrl)
} else {
    download.file(winterPressuresDataUrl, './spreadsheet')
    winterPressuresWorkbook <- loadWorkbook('./spreadsheet')
}

print('*************************AMBULANCES START')
ambulances <- readWorksheet(winterPressuresWorkbook, sheet='Ambulances queuing')
startIndex <- columnStartIndex * 5
endIndex <- startIndex + 4
ambulances <- ambulances[17:nrow(ambulances), c(seq(3,4), seq(startIndex, endIndex))]

colnames(ambulances) <- c(paste('var', seq(1,ncol(ambulances)), sep=''))
ambulances$var3 <- as.numeric(gsub(',', '', gsub('-', 0, ambulances$var3)))
ambulances$var4 <- as.numeric(gsub(',', '', gsub('-', 0, ambulances$var4)))
ambulances$var5 <- as.numeric(gsub(',', '', gsub('-', 0, ambulances$var5)))
ambulances$var6 <- as.numeric(gsub(',', '', gsub('-', 0, ambulances$var6)))
ambulances$var7 <- as.numeric(gsub(',', '', gsub('-', 0, ambulances$var7)))
if (length(complete.cases(ambulances)) != nrow(ambulances)) {
    print('we have a problem with the data')
}
ambulances$ambulances_queuing <- rowSums(ambulances[,3:7])

winterPressuresData <- ambulances[,c('var1', 'ambulances_queuing')]

# Cancelled operations
operations <- readWorksheet(winterPressuresWorkbook, sheet='Cancelled operations')
mon <- (15 * columnStartIndex) - 8
tue <- mon + 3
wed <- tue + 3
thu <- wed + 3
fri <- thu + 3
operations <- operations[17:nrow(operations), c(3,4, mon, tue, wed, thu, fri)]
colnames(operations) <- c(paste('var', seq(1,ncol(operations)), sep=''))
operations$var3 <- as.numeric(gsub(',', '', gsub('-', 0, operations$var3)))
operations$var4 <- as.numeric(gsub(',', '', gsub('-', 0, operations$var4)))
operations$var5 <- as.numeric(gsub(',', '', gsub('-', 0, operations$var5)))
operations$var6 <- as.numeric(gsub(',', '', gsub('-', 0, operations$var6)))
operations$var7 <- as.numeric(gsub(',', '', gsub('-', 0, operations$var7)))
if (length(complete.cases(operations)) != nrow(operations)) {
    print('we have a problem with the data')   
}

operations$cancelled_operations <- rowSums(operations[,3:7])
winterPressuresData <- merge(winterPressuresData, operations[,c('var1', 'cancelled_operations')])
print('*************************DTOC START')
# delayed transfer of care
dtoc <- readWorksheet(winterPressuresWorkbook, sheet='Delayed transfers of care')
startIndex <- columnStartIndex * 5
endIndex <- startIndex + 4
dtoc <- dtoc[17:nrow(dtoc), c(seq(3,4), seq(startIndex, endIndex))]
colnames(dtoc) <- c(paste('var', seq(1,ncol(dtoc)), sep=''))

dtoc$var3 <- as.numeric(gsub(',', '', gsub('-', 0, dtoc$var3)))
dtoc$var4 <- as.numeric(gsub(',', '', gsub('-', 0, dtoc$var4)))
dtoc$var5 <- as.numeric(gsub(',', '', gsub('-', 0, dtoc$var5)))
dtoc$var6 <- as.numeric(gsub(',', '', gsub('-', 0, dtoc$var6)))
dtoc$var7 <- as.numeric(gsub(',', '', gsub('-', 0, dtoc$var7)))
if (length(complete.cases(dtoc)) != nrow(dtoc)) {
    print('we have a problem with the data')  
}
dtoc$dtoc <- rowSums(dtoc[,3:7])
winterPressuresData <- merge(winterPressuresData, dtoc[,c('var1', 'dtoc')])

print('*************************NOROVIRUS START')
# norovirus 
norovirus <- readWorksheet(winterPressuresWorkbook, sheet='D&V, Norovirus')
mon <- (10 * columnStartIndex) - 5
tue <- mon + 2
wed <- tue + 2
thu <- wed + 2
fri <- thu + 2
norovirus <- norovirus[17:nrow(norovirus), c(3, 4, mon, tue, wed, thu, fri)]
colnames(norovirus) <- c(paste('var', seq(1,ncol(norovirus)), sep=''))
norovirus$var3 <- as.numeric(gsub(',', '', gsub('-', 0, norovirus$var3)))
norovirus$var4 <- as.numeric(gsub(',', '', gsub('-', 0, norovirus$var4)))
norovirus$var5 <- as.numeric(gsub(',', '', gsub('-', 0, norovirus$var5)))
norovirus$var6 <- as.numeric(gsub(',', '', gsub('-', 0, norovirus$var6)))
norovirus$var7 <- as.numeric(gsub(',', '', gsub('-', 0, norovirus$var7)))
if (length(complete.cases(norovirus)) != nrow(norovirus)) {
    print('we have a problem with the data')  
}
norovirus$norovirus <- rowSums(norovirus[,3:7])
winterPressuresData <- merge(winterPressuresData, norovirus[,c('var1', 'norovirus')])

colnames(winterPressuresData) <- c('code', 'ambulances_queuing', 'planned_operations',  'beds_blocked', 'beds_closed_dueto_norovirus')

# load ae sitrep for the week
weeklyAeSitrep <- read.csv(paste(getwd(), '/weekly_ae_sitrep.csv', sep=''))

weekDataSet <- merge(weeklyAeSitrep, winterPressuresData)


# add England values
englandWeeklySitreps <- read.csv(paste(getwd(), '/weekly_england_figures.csv', sep=''))
englandWeeklySitreps <- cbind(englandWeeklySitreps, as.data.frame(t(colSums(weekDataSet[,8:ncol(weekDataSet)]))))

# # colchester was removed in week 11 as it had missing data
# weekDataSet <- weekDataSet[weekDataSet$code != 'RDE', ]

englandWeeklySitreps$total_ambulances_queuing <- sum(weekDataSet$ambulances_queuing)
englandWeeklySitreps$ambulances_queuing <- mean(weekDataSet$ambulances_queuing, na.rm=TRUE)
englandWeeklySitreps$planned_operations <- mean(weekDataSet$planned_operations, na.rm=TRUE)
print(paste('Average planned operations', englandWeeklySitreps$planned_operations))
englandWeeklySitreps$beds_blocked <- mean(weekDataSet$beds_blocked, na.rm=TRUE)
englandWeeklySitreps$beds_closed_dueto_norovirus <- mean(weekDataSet$beds_closed_dueto_norovirus, na.rm=TRUE)

rownames(weekDataSet) <- weekDataSet[,1]
weekDataSet <- weekDataSet[,-1]
jsonString <- toJSON(as.data.frame(t(weekDataSet)))
write(jsonString, paste(weekWorkingDirectory, '/weekly_ae_sitrep.json', sep=''))

#     write out country (england) level dataset
rownames(englandWeeklySitreps) <- englandWeeklySitreps[,1]
englandWeeklySitreps <- englandWeeklySitreps[,-1]
englandJson <- toJSON(englandWeeklySitreps)
write(englandJson, paste(weekWorkingDirectory, '/weekly_england_sitrep.json', sep=''))

write.csv(weekDataSet, paste('wee0_unmerge/fordatacheck/current-week-dataset.csv', sep=''))


