$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

	$(document).ready(function(){

        loadInbox();
        dataTableAlertPrevent('table');

        $('#inbox').on('click', '.btn-read', function(){
            var messageID = $(this).parents('tr').attr('id');
            var readModal = $('#readModal');
            var table = $('#inbox').DataTable();

            $.ajax({
                type: 'GET',
                url: `${API_URL_ROOT}/messages/${messageID}`,
                dataType: 'json',
                headers: {'x-access-token':token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var msg = response.message;
                        readModal.find('.modal-title').text(`${msg.sender_name} | ${moment.unix(msg.sent_at).format('MMMM Do YYYY, h:mm:ss a')}`);
                        readModal.find('.message').html(msg.message);
                        table.ajax.reload(null, false);
                        notifications();
                    }
                    else
                    {
                        showSimpleMessage("Attention", response.message, "error");
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", req.responseJSON.message, "error");
                }
            });
        });    

        $('#inbox').on('click', '.btn-delete', function(){
            var messageID = $(this).parents('tr').attr('id');
            deleteMessage(messageID)
        })
    });

    //internal function to delete message
    function deleteMessage(messageID) 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to delete this message?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var table = $('#inbox');
                blockUI();         

                $.ajax({
                    type: 'DELETE',
                    url: `${API_URL_ROOT}/messages/${messageID}`,
                    dataType: 'json',
                    headers: {'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");
                            table.DataTable().ajax.reload(null, false);
                            notifications();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                });
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //load Inbox
    function loadInbox()
    {
        var table = $('#inbox');

        table.DataTable({
            oLanguage: {
                oPaginate: { 
                    sPrevious: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' 
                },
                sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
                sSearch: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
                sSearchPlaceholder: "Search...",
               sLengthMenu: "Results :  _MENU_",
            },
            lengthMenu: [7, 10, 20, 50, 100, 500, 1000],
            stripeClasses: [],
            drawCallback: function () { $('.dataTables_paginate > .pagination').addClass(' pagination-style-13 pagination-bordered mb-5'); },
            language: {
                infoEmpty: "<span style='color:red'><b>No records found</b></span>"
            },
            processing: true,
            serverSide: true,
            destroy: true,
            autoWidth: false,
            pageLength: 100,
            ajax: {
                type: 'GET',
                url: `${API_URL_ROOT}/messages/datatable/fetch`,
                dataType: 'json',
                headers:{'x-access-token':token},
                complete: function()
                {
                    //$("#loadingScreen").hide();
                    //$('.panel-refresh').click();
                },
                async: true,
                error: function(xhr, error, code)
                {
                    console.log(xhr);
                    console.log(code);
                }
            },
            columnDefs: [
                { orderable: false, targets: [1,2, 3, 4, 5] }
            ],
            order: [[0, "desc"]],
            columns: [
                {
                    data: 'message_id',
                    render: function (data, type, row, meta) 
                    {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                {
                    data: 'sender_name',
                    render: function(data, type, row, meta)
                    {
                        var name = row['message_status'] === "Unread" ? '<b>'+data+'</b>' : data;

                        return name;
                    }
                },
                {data: 'sender_email'},
                {
                    data: 'sent_at',
                    render: function(data, type, row, meta)
                    {
                        var createdAt = moment.unix(data).format('MMMM Do YYYY, h:mm:ss a');
                        return createdAt;
                    }
                },
                {
                    data: 'message_status',
                    render: function(data)
                    {
                        var status = data === "Unread" ? `<span class="badge outline-badge-danger">Unread</span>` : `<span class="badge outline-badge-success">Read</span>`;

                        return status;
                    }
                },
                {
                    data: 'message_id',
                    render: function(data)
                    {
                        return `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-delete" title="Delete Message"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-read" title="Read More" data-toggle="modal" data-target="#readModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                            </button>
                        `;
                    },
                    searchable: false,
                    sortable: false
                }
            ]  
        });
    }
}); 