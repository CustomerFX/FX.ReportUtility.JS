define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
	'Sage/Utility/Jobs',
],
function (
    declare, 
    lang,
	jobs
) {
    fxReportUtility = {
        
        runReport: function(reportName, recordSelection, parameters, title, fileName) {
            var reportNameParts = reportName.split(':'),
                pluginName = reportNameParts[1],
                pluginFamily = reportNameParts[0];
                
            if (!title) 
                title = pluginName;
                
            if (!fileName)
                fileName = pluginName + '-' + (new Date()).toISOString().substring(0, 10);
                
            var params = [];
            parameters.forEach(function(p) { params.push(FX.ReportUtility.getParameter(p.name, p.value)); });
            
            var reportOptions = [
                { 'name':'PluginFamily', 'value':pluginFamily },
                { 'name':'PluginName', 'value':pluginName },
                { 'name':'TemplateName', 'value':pluginName },
                { 'name':'ReportConditions' },
                { 'name':'ConditionsConnector', 'value':'And' },
                { 'name':'RecordSelectionFormula', 'value':recordSelection },
                { 'name':'ReportParameters', 'value':params },
                { 'name':'ScheduleName', 'value':pluginName },
                { 'name':'OutputFormat', 'value':'Pdf' }
            ];
            
            var options = {
				key: 'Saleslogix.Reporting.Jobs.CrystalReportsJob',
                reportType: 'Crystal', 
                reportId: Sage.Services.getService('ReportingService').getReportId(reportName),
                descriptor: fileName,
                title: title,
                closable: true,
                parameters: reportOptions,
                success: function(result) { console.log('FX.ReportUtility.runReport success', result); },
                failure: function(result) { console.log('FX.ReportUtility.runReport failure', result); }
            }
            jobs.triggerJobAndDisplayProgressDialog(options);
        },
        
        getParameter: function(paramName, paramValue) {
            return {
                'className':'CrystalReports.ParameterField',
                'name':paramName,
                'parameterFieldName':paramName,
                'type':'StringField',
                'length':65534,
                'promptText':paramName,
                'isRecurring':false,
                'formulaForm':'{?' + paramName + '}',
                'kind':'ParameterField',
                'headingText':null,
                'useCount':1,
                'defaultValues':null,
                'currentValues':[
                    {
                        'className':'CrystalReports.ParameterFieldDiscreteValue',
                        'computedText':'\'' + paramValue + '\'',
                        'description':paramValue,
                        'discreteValue':{
                            'actualValue':paramValue,
                            'actualValueType':'String',
                            'value':paramValue,
                            'valueType':'String'
                        }
                    }
                ],
                'allowMultiValue':false,
                'values':null,
                'reportName':null,
                'parameterType':'ReportParameter',
                'reportParameterType':'ReportParameter',
                'allowNullValue':false,
                'minimumValue':null,
                'maximumValue':null,
                'editMask':null,
                'allowCustomCurrentValues':true,
                'defaultValueSortOrder':'NoSort',
                'defaultValueSortMethod':'BasedOnValue',
                'valueRangeKind':'Discrete',
                'usage':57,
                'defaultValueDisplayType':'DescriptionAndValue',
                'isOptionalPrompt':false,
                'isShownOnPanel':true,
                'isEditableOnPanel':true,
                'initialValues':null,
                'promptToUser':true,
                'isDataFoundationParameter':false,
                'allowHierarchyValues':false,
                'keepLastValueSelected':true,
                'hasCurrentValue':false,
                'parameterFieldUsage2':'InUse, ShowOnPanel, EditableOnPanel, DataFetching',
                'parameterValueKind':'StringParameter',
                'isDynamic':false,
                'isInvalidDynamicParameter':false,
                'invalidDynamicParameterReason':null,
                'clientMustQueryDynamicData':false,
                'actualValueType':'String',
                'valueType':'String',
                'beginValueType':'String',
                'endValueType':'String'
            };
        }
        
    };
    
    window.FX = window.FX || {};
    window.FX.ReportUtility = fxReportUtility;
    return fxReportUtility;
});