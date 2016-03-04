<%@ page title="Group Configuration" language="C#" masterpagefile="~/Site.master" autoeventwireup="true" inherits="Group, App_Web_zhfkqfbr" %>



<asp:Content runat="server" ID="FeaturedContent" ContentPlaceHolderID="FeaturedContent">
    <section class="featured">
        <div class="content-wrapper">
            <hgroup class="title">
                <h1>PQDashboard Administrator <%: Title %></h1>
            </hgroup>
            <asp:Menu ID="Menu1" runat="server" DataSourceID="SiteMapDataSource1">
            </asp:Menu>
            <asp:SiteMapDataSource ID="SiteMapDataSource1" runat="server" />
        </div>
    </section>
</asp:Content>



<asp:Content ID="Content3" ContentPlaceHolderID="MainContent" Runat="Server">
    
<style>
            .floating {
                display: inline;
                float: left;
                margin: 0;
                padding: 0;
                position: relative;
            }
    .auto-style1 {
        width: 157px;
    }
    .auto-style2 {
        width: 100px;
    }
</style>

    <script type="text/javascript">

        function RefreshUpdatePanel() {
            setTimeout(DoPostback, 5000);

        };

        function DoPostback() {
            __doPostBack('<%= TextBox1.ClientID %>', '');
            document.getElementById('<%= TextBox1.ClientID %>').focus();

        };
    </script>

    <asp:Panel ID="Panel1" runat="server" Width="60%" CssClass="floating">
    <asp:ListView  ID="ListView1" runat="server" DataKeyNames="ID" DataSourceID="groupDataSource" InsertItemPosition="LastItem">
        <AlternatingItemTemplate>
            <tr style="">
                <td nowrap>
                    <asp:Button ID="DeleteButton" OnClick="ButtonDelete_Click" runat="server" CommandName="Delete" Text="Delete" />
                    <asp:Button ID="EditButton" OnClick="ButtonEdit_Click" runat="server" CommandName="Edit" Text="Edit" />
                </td>
                <td nowrap>
                    <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                </td>
                <td nowrap>
                    <asp:Label ID="groupNameLabel" runat="server" Text='<%# Eval("groupName") %>' />
                </td>
                <td nowrap>
                    <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Eval("Active") %>' Enabled="false" />
                </td>
            </tr>
        </AlternatingItemTemplate>
        <EditItemTemplate>
            <tr style="">
                <td nowrap>
                    <asp:Button ID="UpdateButton" OnClick="ButtonUpdate_Click" runat="server" CommandName="Update" Text="Update" />
                    <asp:Button ID="CancelButton" OnClick="ButtonCancel_Click" runat="server" CommandName="Cancel" Text="Cancel" />
                </td>
                <td nowrap>
                    <asp:Label ID="IDLabel1" runat="server" Text='<%# Eval("ID") %>' />
                </td>
                <td nowrap>
                    <asp:TextBox ID="groupNameTextBox" runat="server" Text='<%# Bind("groupName") %>' />
                </td>
                <td nowrap>
                    <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Bind("Active") %>' />
                </td>
            </tr>
        </EditItemTemplate>
        <EmptyDataTemplate>
            <table runat="server" style="">
                <tr>
                    <td>No data was returned.</td>
                </tr>
            </table>
        </EmptyDataTemplate>
        <InsertItemTemplate>
            <tr style="">
                <td nowrap>
                    <asp:Button ID="InsertButton" OnClick="ButtonInsert_Click" runat="server" CommandName="Insert" Text="Insert" />
                    <asp:Button ID="CancelButton" OnClick="ButtonCancel_Click" runat="server" CommandName="Cancel" Text="Clear" />
                </td>
                <td nowrap>&nbsp;</td>
                <td nowrap>
                    <asp:TextBox ID="groupNameTextBox" runat="server" Text='<%# Bind("groupName") %>' />
                </td>
                <td nowrap>
                    <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Bind("Active") %>' />
                </td>
            </tr>
        </InsertItemTemplate>
        <ItemTemplate>
            <tr style="">
                <td nowrap>
                    <asp:Button ID="DeleteButton" OnClick="ButtonDelete_Click" runat="server" CommandName="Delete" Text="Delete" />
                    <asp:Button ID="EditButton" OnClick="ButtonEdit_Click" runat="server" CommandName="Edit" Text="Edit" />
                </td>
                <td nowrap>
                    <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                </td>
                <td nowrap>
                    <asp:Label ID="groupNameLabel" runat="server" Text='<%# Eval("groupName") %>' />
                </td>
                <td nowrap>
                    <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Eval("Active") %>' Enabled="false" />
                </td>
            </tr>
        </ItemTemplate>
        <LayoutTemplate>
            <table runat="server">
                <tr runat="server">
                    <td nowrap runat="server">
                        <table id="itemPlaceholderContainer" runat="server" border="0" style="">
                            <tr runat="server" style="">
                                <th runat="server"></th>
                                <th runat="server">ID</th>
                                <th runat="server">groupName</th>
                                <th runat="server">Active</th>
                            </tr>
                            <tr id="itemPlaceholder" runat="server">
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr runat="server">
                    <td nowrap runat="server" style="">
                        <asp:DataPager ID="DataPager1" runat="server">
                            <Fields>
                                <asp:NextPreviousPagerField ButtonType="Button" ShowFirstPageButton="True" ShowLastPageButton="True" />
                            </Fields>
                        </asp:DataPager>
                    </td>
                </tr>
            </table>
        </LayoutTemplate>
        <SelectedItemTemplate>
            <tr style="">
                <td nowrap>
                    <asp:Button ID="DeleteButton" OnClick="ButtonDelete_Click" runat="server" CommandName="Delete" Text="Delete" />
                    <asp:Button ID="EditButton" OnClick="ButtonEdit_Click" runat="server" CommandName="Edit" Text="Edit" />
                </td>
                <td nowrap>
                    <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                </td>
                <td nowrap>
                    <asp:Label ID="groupNameLabel" runat="server" Text='<%# Eval("groupName") %>' />
                </td>
                <td nowrap>
                    <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Eval("Active") %>' Enabled="false" />
                </td>
            </tr>
        </SelectedItemTemplate>
    </asp:ListView>
</asp:Panel>
<asp:Panel ID="Panel2" Visible="False" runat="server" Width="40%" CssClass="floating">
    <div width="100%">
        <table>
            <tr>
                <td align="center" class="auto-style1">
                    <table width="160px">
                        <tr>
                            <td colspan="2" align="center">
                                Available Meters
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <asp:TextBox ID="TextBox1" runat="server" Width="121px" onkeyup="RefreshUpdatePanel();" OnTextChanged="TextBox1_TextChanged" AutoPostBack="True" ></asp:TextBox>
                            </td>
                            <td>
                                <input type="image" src="Images/magnify.png" alt="Submit" height="16px" width="16px">
                            </td>
                        </tr>

                    </table>
                        
                </td>
                <td class="auto-style2"></td>
                <td align="center">Authorized Meters</td>
            </tr>
            <tr>
                <td class="auto-style1" ><asp:ListBox ID="ListBox1" runat="server"
                                    DataSourceID="meterDataSource" 
                                    DataTextField="Name" 
                                    DataValueField="ID"
                                    SelectionMode="Multiple" 
                                    Width="150px" 
                                    Height="500px">
                        </asp:ListBox>
                </td>
                <td valign="middle" align="center" class="auto-style2">
                    <asp:Button ID="ButtonAdd" runat="server" 
                                Text=">" 
                                OnClick="ButtonAdd_Click"  
                                Width="50px"/><br />
     
                    <asp:Button ID="ButtonRemove" runat="server" 
                                Text="<" 
                                OnClick="ButtonRemove_Click" 
                                Width="50px"/> <br />
     
                    <asp:Button ID="ButtonAddAll" runat="server" 
                                Text =">>>" 
                                OnClick="ButtonAddAll_Click" 
                                Width="50px"/> 
                    <br />
     
                    <asp:Button ID="ButtonRemoveAll" runat="server" 
                                Text ="<<<" 
                                OnClick="ButtonRemoveAll_Click" 
                                Width="50px"/>
                </td>
                <td>
                    <asp:ListBox ID="ListBox2" runat="server"
                                DataSourceID="GroupMeterDataSource" 
                                DataTextField="Name" 
                                DataValueField="ID"
                                SelectionMode="Multiple" 
                                Width="150px" 
                                Height="500px">
                    </asp:ListBox>
                </td>
            </tr>
        </table>
    </div>
    <asp:SqlDataSource ID="meterDataSource" 
        runat="server" 
        ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>"
        DeleteCommand="" 
        InsertCommand="" 
        SelectCommand="" 
        UpdateCommand="">
    </asp:SqlDataSource>

    <asp:SqlDataSource ID="GroupMeterDataSource" runat="server" 
        ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>" 
        DeleteCommand="" 
        InsertCommand="" 
        SelectCommand="" 
        UpdateCommand="">
    </asp:SqlDataSource>

</asp:Panel>
    

    <asp:SqlDataSource ID="groupDataSource" runat="server" ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>" 
        DeleteCommand="DELETE FROM [Group] WHERE [ID] = @ID" 
        InsertCommand="INSERT INTO [Group] ([groupName], [Active]) VALUES (@groupName, @Active)" 
        SelectCommand="SELECT [ID], [groupName], [Active] FROM [Group]" 
        UpdateCommand="UPDATE [Group] SET [groupName] = @groupName, [Active] = @Active WHERE [ID] = @ID">
        <DeleteParameters>
            <asp:Parameter Name="ID" Type="Int32" />
        </DeleteParameters>
        <InsertParameters>
            <asp:Parameter Name="groupName" Type="String" />
            <asp:Parameter Name="Active" Type="Boolean" />
        </InsertParameters>
        <UpdateParameters>
            <asp:Parameter Name="groupName" Type="String" />
            <asp:Parameter Name="Active" Type="Boolean" />
            <asp:Parameter Name="ID" Type="Int32" />
        </UpdateParameters>
    </asp:SqlDataSource>
    

</asp:Content>

