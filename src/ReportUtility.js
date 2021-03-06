/*
	Customer FX Report Utility
	See license and usage information at https://github.com/CustomerFX/FX.ReportUtility.JS
	
	Copyright (c) 2017 Customer FX Corporation
	http://customerfx.com
*/

define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/_base/connect',
    'dojo/dom',
    'dojo/query',
    'Sage/Utility/Jobs'
],
function (
    declare, 
    lang,
    connect,
    dom,
    query,
    jobs
) {
    var __reportUtility = {
        
        runReport: function(reportName, recordSelection, parameters, title, fileName, completeMessage) {
            var reportNameParts = reportName.split(':'),
                pluginName = reportNameParts[1],
                pluginFamily = reportNameParts[0];
                
            if (!title) 
                title = pluginName;
                
            if (!fileName)
                fileName = pluginName + '-' + (new Date()).toISOString().substring(0, 10);
                
            var reportParams = (parameters || []).map(function(param) { 
				switch (param.type) {
					case undefined:
					case 'string':
					case 'text':
						return this._getStringParameter(param.name, param.value);
						break;
					case 'range':
						return this._getDateRangeParameter(param.name, param.valueStart, param.valueEnd);
						break;
					default:
						throw new Error('The parameter type "' + param.type + '" is not yet supported.');
				}
			}, this);
            
            var reportOptions = [
                { 'name':'PluginFamily', 'value':pluginFamily },
                { 'name':'PluginName', 'value':pluginName },
                { 'name':'TemplateName', 'value':pluginName },
                { 'name':'ReportConditions' },
                { 'name':'ConditionsConnector', 'value':'And' },
                { 'name':'RecordSelectionFormula', 'value':recordSelection },
                { 'name':'ReportParameters', 'value':(reportParams || []) },
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
            };
			
            jobs.triggerJobAndDisplayProgressDialog(options);
			
			if (completeMessage) {
				var hnd = connect.subscribe('/job/execution/changed', function(job) { 
					if (job && job._options && job._options.title == options.title) {
						var lnk = query('#progressDialogLinkDiv a').first();
						if (lnk && lnk.attr('href') && lnk.attr('href').length && lnk.attr('href')[0].indexOf('javascript: Sage.Utility.File.Attachment.getAttachment') == 0) {
							var elem = dom.byId('progressDialogMessageDiv');
							if (elem) elem.innerHTML = completeMessage;
						}
						hnd.remove();
					}
				});
			}
        },
        
        _getStringParameter: function(paramName, paramValue) {
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
        },
		
		/* values must be in format of YYYY-MM-DD */
        _getDateRangeParameter: function(paramName, startValue, endValue) {
			if (!this._validateDateParam(startValue) || !this._validateDateParam(endValue)) {
				throw new Error('Date parameters are not in the correct format. Dates must be passed as "YYYY-MM-DD" formatted strings.');
			}
		
            return {
                'className': 'CrystalReports.ParameterField',
                'name': paramName,
                'parameterFieldName': paramName,
                'type': 'DateField',
                'length': 4,
                'promptText': paramName,
                'isRecurring': false,
                'formulaForm': '{?' + paramName + '}',
                'kind': 'ParameterField',
                'headingText': null,
                'useCount': 1,
                'defaultValues': null,
                'currentValues': [
                    {
                        'className': 'CrystalReports.ParameterFieldRangeValue',
                        'description': '[' + startValue + ' .. ' + endValue + ']',
                        'rangeDateValue': startValue + 'T07:00:00Z;' + endValue + 'T07:00:00Z',
                        'rangeValue': {
                            'beginValue': startValue + 'T07:00:00Z',
                            'beginValueType': 'DateTime',
                            'endValue': endValue + 'T07:00:00Z',
                            'endValueType': 'DateTime',
                            'lowerBoundType': 'BoundInclusive',
                            'upperBoundType': 'BoundInclusive'
                        }
                    }
                ],
                'allowMultiValue': false,
                'values': null,
                'reportName': null,
                'parameterType': 'ReportParameter',
                'reportParameterType': 'ReportParameter',
                'allowNullValue': false,
                'minimumValue': null,
                'maximumValue': null,
                'editMask': null,
                'allowCustomCurrentValues': true,
                'defaultValueSortOrder': 'NoSort',
                'defaultValueSortMethod': 'BasedOnValue',
                'valueRangeKind': 'Range',
                'usage': 33,
                'defaultValueDisplayType': 'Description',
                'isOptionalPrompt': false,
                'isShownOnPanel': false,
                'isEditableOnPanel': false,
                'initialValues': null,
                'promptToUser': true,
                'isDataFoundationParameter': false,
                'allowHierarchyValues': false,
                'keepLastValueSelected': true,
                'hasCurrentValue': false,
                'parameterFieldUsage2': 'InUse, DataFetching',
                'parameterValueKind': 'DateParameter',
                'isDynamic': false,
                'isInvalidDynamicParameter': false,
                'invalidDynamicParameterReason': null,
                'clientMustQueryDynamicData': false,
                'actualValueType': 'DateTime',
                'valueType': 'DateTime',
                'beginValueType': 'DateTime',
                'endValueType': 'DateTime'
            };
        },
		
		_validateDateParam: function(dateValue) {
			var t = dateValue.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
			return (t !== null);
		}
        
    };
    
    window.FX = window.FX || {};
    window.FX.ReportUtility = __reportUtility;
    return __reportUtility;
});
