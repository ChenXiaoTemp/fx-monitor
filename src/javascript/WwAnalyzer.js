analyzer=require('ww.emal.analyzer',function(namespace){
    namespace.getParams=function(){
        var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    let urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
       return urlParams
    }

    namespace.parse51Job=function(body,from){
        const channel='前程无忧';
        let name=from.substring('前程无忧[51job] '.length,from.indexOf('&lt')-1).trim()
        const ele=$(body)
        const nameDetails=ele.find('strong:first-child:contains(\"'+name+'\")').parent().text().split(/[|\n]/).filter(e=>e.trim()!="").map(e=>e.trim())
        let sex=nameDetails[1]
        let birthDay=nameDetails[2]
        if(birthDay){
            const start=birthDay.indexOf('(')
            const end=birthDay.indexOf(')')
            if(start!=-1&&end!=-1){
                birthDay=birthDay.substring(start+1,end);
            }
        }
        let phone=ele.find('table:contains("手机："):contains("邮箱："):contains("居住地")').find('table:first-child:contains("手机：")').text()
        if(phone && phone.indexOf('手机：')!=-1){
            phone=phone.replace('手机：','').trim()
        }
        let email=ele.find('table:contains("手机："):contains("邮箱："):contains("居住地")').find('table:first-child:contains("邮箱：")').text()
        if(email && email.indexOf('邮箱：')){
            email=email.replace('邮箱：','').trim()
        }

        let location=ele.find('table:contains("手机："):contains("邮箱："):contains("居住地：")').find('table:first-child:contains("居住地：")').text()
        if(location && location.indexOf('居住地：')){
            location=location.replace('居住地：','').trim()
        }

        let otherDetails=ele.find('table:contains("专业："):contains("学校："):contains("学历/学位：")').text().split(/\s+/).filter(e=>e.trim()!="")
        let educationDetail='未知'
        let educationDetailMajor="未知"
        let education='未知'
        for(let i=0;i<otherDetails.length;i++){
            if(otherDetails[i]=='专业：' && otherDetails.length>i+1){
                educationDetailMajor=otherDetails[i+1];
            }
            else if(otherDetails[i]=='学校：' && otherDetails.length>i+1){
                educationDetail=otherDetails[i+1];
            }
            else if(otherDetails[i]=='学历/学位：' && otherDetails.length>i+1){
                education=otherDetails[i+1];
            }
        }
        return {
            channel,name,phone,sex,birthDay,location,education,educationDetail,email,educationDetailMajor
        }
    }

    namespace.parseZhiLian=function(body,from){
        const channel='智联招聘';
        let name=from.substring('智联求职者 '.length,from.indexOf('&lt')-1)
        let ele=$(body)
        const phoneEle=ele.find("tr p:contains('手机：')");
        let phone=phoneEle.text()
        if(phone){
            phone=phone.substring(phone.indexOf('手机：')+'手机：'.length).trim()
        }
        else{
            phone='未找到';
        }
        let email=phoneEle.parent().find('span').text()
        let elements=ele.find("font:first-child").parent().text().split(/[|\n]/).map(e=>e.trim()).filter(e=>e!="")
        let sex=elements[0]
        let birthDay=elements[1]
        let index=1;
        while(elements.length>index && elements[index].indexOf('(')==-1){
            index++
        }
        let location=elements[2]
        let education=elements[3]
        if(index<elements.length){
            birthDay=elements[index++]
            location=elements[index++]
            education=elements[index++]
        }
        
        if(birthDay){
            birthDay=birthDay.replace('(','').replace(')','')
        }

        if(location){
            location=location.replace('现居住于','')
        }

        const elementsTmp=ele.find('table span:contains("教育经历")').parents('table')
        let educationDetail=null;
        let educationDetailMajor=null;
        if(elementsTmp.length>0){
            const texts=$(elementsTmp[0]).parent().find('span').text().split(/\s+/)
            educationDetail=texts[1]
            educationDetailMajor=texts[2]
        }
        return {
            channel,name,phone,sex,birthDay,location,education,educationDetail,email,educationDetailMajor
        }
    }

    const headers={
        recruitment_loc:'招聘地点',
        email:'个人邮箱',
        channel:'简历来源',
        resume_state:'简历状态',
        position:'职位',
        name:'姓名',
        sex:'性别',
        principal:'电话沟通人',
        date:'沟通日期',
        video_principal:'视频负责人',
        interview_date:'面试日期',
        phone:'联系电话',
        graduate_date:'毕业时间',
        educationDetail:'最终毕业学校',
        educationDetailMajor:'专业',
        education:'最高学历',
        hometown:'籍贯',
        target_place:'可分配地点',
        arrive_date:'预计到岗时间',
        qq:'QQ号码',
        testScore:'测试得分',
        evaluation:'评价',
        salary:'薪资',
        phoneCallRecord:'电话沟通记录',
        videoInterviewRecord:'视频面试记录'
        //birthDay:'出生日期',
        //location:'现居住地'
    }

    namespace.exportToCsv = function(rows){
        let csvContent = "data:text/csv;charset=utf-8," 
        const fields=Object.keys(headers)
        for(let i=0;i<fields.length;i++){
            csvContent+=headers[fields[i]]+','
        }
        csvContent+='\n';
        for(let i=0;i<rows.length;i++){
            const row=rows[i]
            for(let j=0;j<fields.length;j++){
                csvContent+=(row[fields[j]]||'')+','
            }
            csvContent+='\n';
        }
        let encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }

    namespace.DataCollector=function(expectedCount,cb,errCb){
        this.result=[]
        this.elements=[]
        this._finishCb=cb
        this._errCb=errCb
        this.expectedCount=expectedCount
        this.unsupportEmails=[]
        this.errorReported=false
    }
    namespace.DataCollector.prototype.reset=function(){
        this.result=[]
        this.elements=[]
        this.unsupportEmails=[]
        this.expectedCount=0
        this.errorReported=false
    }

    namespace.DataCollector.prototype.showMessage=function(){
        if(this.unsupportEmails.length>0){
            return '只支持智联招聘以及前程无忧的简历，:'+this.unsupportEmails.join(',')+'的简历无法处理';
        }
        else if(this.result.length!=this.elements.length){
            return "一些邮件无法处理";
        }
        else if(this.expectedCount>this.elements.length){
            return '获取右键信息超时';
        }
        return null;
    }

    namespace.DataCollector.prototype.addResult=function(data,status){
        let {message}=data
        this.elements.push(data)
        if(message){
            if(message.from && message.from.startsWith('前程无忧[51job]')){
                let res=analyzer.parse51Job(message.body,message.from)
                if(res){
                    this.result.push(res)
                }
            }
            else if(message.from && message.from.startsWith('智联求职者')){
                let res=analyzer.parseZhiLian(message.body,message.from)
                if(res){
                    this.result.push(res)
                }
            }
            else{
                this.unsupportEmails.push(message.subject)
            }
        }

        if(this.elements.length==this.expectedCount){
            this._finishCb(this.result,this.elements)
            this.getAndSetReport(true)
            if(this._errCb){
                let errorMessage=this.showMessage()
                if(errorMessage){
                    this._errCb(errorMessage);
                }
            }
        }
    }

    namespace.DataCollector.prototype.getAndSetReport=function(setReport){
        let res=this.errorReported
        this.errorReported=setReport
        return res
    }

    namespace.showErrorMessage=function(message){
        chrome.runtime.sendMessage('', {
            type: 'notification',
            options: {
              title: '处理邮件出错',
              iconUrl:'/image/cry.png',
              message: message||"测试",
              type: 'basic'
            }
          });
    }

    namespace.showWarnMessage=function(message){
        chrome.runtime.sendMessage('', {
            type: 'notification',
            options: {
              title: '操作出错',
              iconUrl:'/image/warn.png',
              message: message,
              type: 'basic'
            }
          });
    }
})

$(document).ready(function(){
    function detectAndStart(){
        $('<a href=\"#\" class="menu-item" title="导出">'+
            '<span class="text-only">'+
            '导出'+
             '</span>'+
             '</a>').click(function(target){
                 let elements=$("div.highlighted",'#listContainer')
                
                 if(elements.length==0){
                    analyzer.showWarnMessage('请选择邮件');
                 }
                 else{
                    const urlParams=analyzer.getParams();
                    let dataToExport=new analyzer.DataCollector(elements.length,function(result,elements){
                        analyzer.exportToCsv(result)
                    },function(errorMessage){
                        analyzer.showErrorMessage(errorMessage);
                    })
                    for(let idx=0;idx<elements.length;idx++){
                        let e=elements[idx]
                        const idStr=$(e).attr('id')
                        const val=idStr.substring('script'.length+1)
                        const emailDetailUrl=`WorldClient.dll?Session=${urlParams['Session']}&View=Message&Preview=Yes&ReturnJavaScript=1&ChangeView=No&NoLoop=1&ContentType=JavaScript&Number=${val}&FolderID=${urlParams['NextFolderID']||10}&CurrentRequest=1&_=${Date.now()}`
                        $.getJSON(emailDetailUrl,function(data,status){
                            dataToExport.addResult(data,status)
                        })
                    }
                    var int1=setInterval(function(){
                        clearInterval(int1)
                        let reported=dataToExport.getAndSetReport(true)
                        if(!reported){
                            let message=dataToExport.showMessage()
                            if(message){
                                analyzer.showErrorMessage(message)
                            }
                        }
                     },10000)
                 }

                 
             }).insertBefore($("#moreLink"))
    }

    var int=setInterval(function(){
        if($("#moreLink").length>0){
            detectAndStart()
            clearInterval(int)
        }
        else{
            console.log('detecting')
        }
    },1000);
    
    
})