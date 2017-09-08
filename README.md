# FX.ReportUtility.JS
A utility module for client-side running reports in Infor CRM *and* programmatically setting report parameters/prompts

## Usage 

The FX.ReportUtility.JS module has a method named runReport which will trigger a job to export a report to a PDF. What makes the FX.ReportUtility.JS different than the normal ReportService in Infor CRM is that you can also set report parameters/prompts via code. 

The runReport method take the following parameters:
* **reportName:** The Family:PluginName of the report to run
* **recordSelection:** A valid Crystal Record Selection Formula. Set as null to not set a report filter
* **parameters:** An array of objects with three properties for string parameters: name and value, for example: `[{tyoe: 'string', name:'MyPrompt', value:'MyValue'}]`, or with four properties for date range parameters, for example: `[{type: 'range', name: 'MyDateRange', startValue: '2017-09-07', endValue: '2017-09-15'}]`. Set as null to not set any parameters
* **title:** (optional) Title of the progress dialog when exporting the report
* **fileName:** (optional) Specify the name of the file you want to use for the exported file (no extension, just name)

## Samples

```javascript
// export report, specify record selection formula & parameter
FX.ReportUtility.runReport('FAMILY:ReportName', '{ACCOUNT:ACCOUNTID} = "AXXXX0000001"', [{name:'MyPrompt', value:'My Value'}]);
```

```javascript
// export report, no record selection formula & multiple parameters
FX.ReportUtility.runReport('FAMILY:ReportName', null, [{name:'MyPrompt1', value:'My Value 1'}, {name:'MyPrompt2', value:'My Value 2'}]);
```

```javascript
// export report, specify record selection formula, no parameters, include title and filename
FX.ReportUtility.runReport('FAMILY:ReportName', '{ACCOUNT:ACCOUNTID} = "AXXXX0000001"', null, 'My Title', 'MyExportedFile');
```

## Limitations 
**Note:** Currently, only string and date range parameters are supported. It looks like the job service might deserialize objects for the JSON for the parameters, so there's a lot of extra baggage being sent with them. At some point, I might dynamically retrieve the parameters from the report plugin itself (the way the report controller does now) and then just set the values in the JSON to dynamically support any parameter type, but for now it will only do these parameters.
