commandLineArgs <- commandArgs(TRUE)

require(XLConnect)
require(rjson)
require(methods)

setwd(commandLineArgs[3])

# $weekIndex $weeklyAeSitrep $winterPressures
weekIndex <- commandLineArgs[1]
# weekIndex <- 11
weekWorkingDirectory <- paste(getwd(), '/week', weekIndex, sep='')

dir.create(weekWorkingDirectory, showWarnings=F)
# setwd(weekWorkingDirectory)

weeklyAeSitrepDataUrl <- commandLineArgs[2]
# weeklyAeSitrepDataUrl <- 'http://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2014/04/2015.01.18-AElYCTq.xls'
download.file(weeklyAeSitrepDataUrl, './spreadsheet')
weeklyAeSitrep <- readWorksheet(loadWorkbook('./spreadsheet'), sheet='A&E Data')

# remove special characters
colnames(weeklyAeSitrep) <- gsub(' ', '_', gsub('[-()<>.&/]', '', weeklyAeSitrep[15,]))
# remove column 2 as it is composed of nulls
weeklyAeSitrep <- weeklyAeSitrep[,-2]

# # make sure column names havent changed 
# print(colnames(weeklyAeSitrep) == c("Area_Team", "Code", "Name", "4Type_1_Departments__Major_AE", "Type_2_Departments__Single_Specialty", "Type_3_Departments__Other_AEMinor_Injury_Unit", "Total_attendances", "8Type_1_Departments__Major_AE.1", "Type_2_Departments__Single_Specialty.1", "Type_3_Departments__Other_AEMinor_Injury_Unit.1", "Total_Attendances__4_hours", "12Percentage_in_4_hours_or_less_type_1", "Percentage_in_4_hours_or_less_all", "14Emergency_Admissions_via_Type_1_AE", "Emergency_Admissions_via_Type_2_AE", "Emergency_Admissions_via_Type_3_and_4_AE", "Other_Emergency_admissions_ie_not_via_AE", "18 Number_of_patients_spending_4_hours_but_12_hours_from_decision_to_admit_to_admission", "Number_of_patients_spending_12_hours_from_decision_to_admit_to_admission"))

weeklyAeSitrep$Code <- gsub(' ','', weeklyAeSitrep$Code)

# weeklyAeSitrep <- weeklyAeSitrep[18:nrow(weeklyAeSitrep), c(2, 3, 4, 8, 12, 14, 18)]
weeklyAeSitrep <- weeklyAeSitrep[18:nrow(weeklyAeSitrep), c('Code', 'Name', 'Type_1_Departments__Major_AE', 'Type_1_Departments__Major_AE.1', 'Percentage_in_4_hours_or_less_type_1', 'Emergency_Admissions_via_Type_1_AE', 'Number_of_patients_spending_12_hours_from_decision_to_admit_to_admission')]
weeklyAeSitrep <- weeklyAeSitrep[!is.na(weeklyAeSitrep$Name) & weeklyAeSitrep$Name != '',]

colnames(weeklyAeSitrep) <- c('code','name','attendances_at_ane','patients_waiting_over_4hrs_tobe_admitted','patients_seen_in_four_hours','emergency_admissions','trolley_wait_4_to_12hrs')

# # df to hold a row whose data needs patching up - requires proper implementation
# patchData <- weeklyAeSitrep[weeklyAeSitrep$code == 'RDE', ]
# # remove the row that needs patching
# weeklyAeSitrep <- weeklyAeSitrep[weeklyAeSitrep$code != 'RDE', ]


weeklyAeSitrep$attendances_at_ane <- as.numeric(gsub(',', '', weeklyAeSitrep$attendances_at_ane))
weeklyAeSitrep$patients_waiting_over_4hrs_tobe_admitted <- as.numeric(gsub(',', '', weeklyAeSitrep$patients_waiting_over_4hrs_tobe_admitted))
weeklyAeSitrep$patients_seen_in_four_hours <- as.numeric(gsub('%', '', weeklyAeSitrep$patients_seen_in_four_hours))
weeklyAeSitrep$emergency_admissions <- as.numeric(gsub(',', '', weeklyAeSitrep$emergency_admissions))
weeklyAeSitrep$trolley_wait_4_to_12hrs <- as.numeric(gsub(',', '', weeklyAeSitrep$trolley_wait_4_to_12hrs))

write(paste('total trusts - ae weekly', nrow(weeklyAeSitrep)))

# weeklyAeSitrep <- weeklyAeSitrep[,]
weeklyAeSitrep <- weeklyAeSitrep[ weeklyAeSitrep$attendances_at_ane != 0, ]
weeklyAeSitrep <- weeklyAeSitrep[ !is.na(weeklyAeSitrep$code), ]
# if number of complete cases is not equal to number of observations then halt execution with error code
if (length(complete.cases(weeklyAeSitrep)) != nrow(weeklyAeSitrep)) {
    print('We have some nulls in the dataset')
    # if number of complete cases is not equal to number of observations then halt execution with error code   
}

# # assign values to patched df
# patchData$attendances_at_ane <- 1304
# patchData$patients_waiting_over_4hrs_tobe_admitted <- 317
# patchData$patients_seen_in_four_hours <- 75.7
# patchData$emergency_admissions <- 443 
# patchData$trolley_wait_4_to_12hrs <- 0

# # add to original data df     
# weeklyAeSitrep <- rbind(weeklyAeSitrep, patchData)   

# construct england weekly figures 
englandWeeklySitreps <- data.frame(code='england', name='england')
englandWeeklySitreps <- cbind(englandWeeklySitreps, as.data.frame(t(colSums(weeklyAeSitrep[,3:ncol(weeklyAeSitrep)]))))

englandWeeklySitreps$patients_waiting_over_4hrs_tobe_admitted <- round(mean(weeklyAeSitrep$patients_waiting_over_4hrs_tobe_admitted, na.rm=TRUE))
englandWeeklySitreps$trolley_wait_4_to_12hrs <- round(mean(weeklyAeSitrep$trolley_wait_4_to_12hrs, na.rm=TRUE))

# weekly ae sitrep data
write.csv(weeklyAeSitrep, paste(getwd(), '/weekly_ae_sitrep.csv', sep=''), row.names=F)
write.csv(englandWeeklySitreps, paste(getwd(), '/weekly_england_figures.csv', sep=''), row.names=F)

