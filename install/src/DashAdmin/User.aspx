
<%@ page title="User Configuration" language="C#" masterpagefile="~/Site.Master" autoeventwireup="true" inherits="User, App_Web_zhfkqfbr" %>

<asp:Content runat="server" ID="FeaturedContent" ContentPlaceHolderID="FeaturedContent">
    <section class="featured">
        <div class="content-wrapper">
            <hgroup class="title">
                <h1>PQDashboard Configuration - <%: Title %></h1>
            </hgroup>
            <asp:Menu ID="Menu1" runat="server" DataSourceID="SiteMapDataSource">
            </asp:Menu>
            <asp:SiteMapDataSource ID="SiteMapDataSource" runat="server" />
        </div>
    </section>
</asp:Content>

<asp:Content runat="server" ID="BodyContent" ContentPlaceHolderID="MainContent">
<style>
            .floating {
                display: inline;
                float: left;
                margin: 0;
                padding: 0;
                position: relative;
            }
</style>

    <asp:Panel ID="Panel1" runat="server" Width="60%" CssClass="floating">
        <asp:ListView ID="ListView1" runat="server" DataKeyNames="ID" DataSourceID="userDataSource" InsertItemPosition="LastItem">
            <AlternatingItemTemplate>
                <tr style="">
                    <td nowrap>
                        <asp:Button ID="DeleteButton" OnClick="ButtonDelete_Click" runat="server" CommandName="Delete" Text="Delete" />
                        <asp:Button ID="EditButton" OnClick="ButtonEdit_Click" runat="server" CommandName="Edit" Text="Edit" />
                    </td>
                    <td>
                        <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                    </td>
                    <td>
                        <asp:Label ID="NameLabel" runat="server" Text='<%# Eval("Name") %>' />
                    </td>
                    <td>
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
                    <td>
                        <asp:Label ID="IDLabel1" runat="server" Text='<%# Eval("ID") %>' />
                    </td>
                    <td>
                        <asp:TextBox ID="NameTextBox" runat="server" Text='<%# Bind("Name") %>' />
                    </td>
                    <td>
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
                    <td>&nbsp;</td>
                    <td>
                        <asp:TextBox ID="NameTextBox" runat="server" Text='<%# Bind("Name") %>' />
                    </td>
                    <td>
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
                    <td>
                        <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                    </td>
                    <td>
                        <asp:Label ID="NameLabel" runat="server" Text='<%# Eval("Name") %>' />
                    </td>
                    <td>
                        <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Eval("Active") %>' Enabled="false" />
                    </td>
                </tr>
            </ItemTemplate>
            <LayoutTemplate>
                <table runat="server">
                    <tr runat="server">
                        <td runat="server">
                            <table id="itemPlaceholderContainer" runat="server" border="0" style="">
                                <tr runat="server" style="">
                                    <th runat="server"></th>
                                    <th runat="server">ID</th>
                                    <th runat="server">Name</th>
                                    <th runat="server">Active</th>
                                </tr>
                                <tr id="itemPlaceholder" runat="server">
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr runat="server">
                        <td runat="server" style="">
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
                    <td align="center">
                        <asp:Label ID="IDLabel" runat="server" Text='<%# Eval("ID") %>' />
                    </td>
                    <td align="center">
                        <asp:Label ID="NameLabel" runat="server" Text='<%# Eval("Name") %>' />
                    </td>
                    <td align="center">
                        <asp:CheckBox ID="ActiveCheckBox" runat="server" Checked='<%# Eval("Active") %>' Enabled="false" />
                    </td>
                </tr>
            </SelectedItemTemplate>
        </asp:ListView>
    </asp:Panel>

    <asp:Panel ID="Panel2" Visible="False" runat="server" Width="40%" CssClass="floating">

            <table>
                <tr>
                    <td align="center">Available Groups</td>
                    <td></td>
                    <td align="center">Authorized Groups</td>
                </tr>
                <tr>
                    <td ><asp:ListBox ID="ListBox1" runat="server"
                                        DataSourceID="groupDataSource" 
                                        DataTextField="groupName" 
                                        DataValueField="ID"
                                        SelectionMode="Multiple" 
                                        Width="150px" 
                                        Height="150px">
                         </asp:ListBox>
                    </td>
                    <td valign="middle" align="center" style="width:100px">
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
                                        DataSourceID="userGroupDataSource" 
                                        DataTextField="groupName" 
                                        DataValueField="ID"
                                    SelectionMode="Multiple" 
                                    Width="150px" 
                                   Height="150px">
                      </asp:ListBox>
                    </td>
                </tr>
    </table>

    <asp:SqlDataSource ID="groupDataSource" runat="server" 
        ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>" 
        DeleteCommand="" 
        InsertCommand="" 
        SelectCommand="" 
        UpdateCommand="">
        
    </asp:SqlDataSource>
    
    <asp:SqlDataSource ID="userGroupDataSource" runat="server" 
        ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>" 
        DeleteCommand="" 
        InsertCommand="" 
        SelectCommand="" 
        UpdateCommand="">

    </asp:SqlDataSource>

</asp:Panel>

        <asp:SqlDataSource ID="userDataSource" runat="server" ConnectionString="<%$ ConnectionStrings:GTCConnectionString %>" DeleteCommand="DELETE FROM [User] WHERE [ID] = @original_ID" InsertCommand="INSERT INTO [User] ([Name], [Active]) VALUES (@Name, @Active)" OldValuesParameterFormatString="original_{0}" SelectCommand="SELECT [ID], [Name], [Active] FROM [User]" UpdateCommand="UPDATE [User] SET [Name] = @Name, [Active] = @Active WHERE [ID] = @original_ID">
            <DeleteParameters>
                <asp:Parameter Name="original_ID" Type="Int32" />
            </DeleteParameters>
            <InsertParameters>
                <asp:Parameter Name="Name" Type="String" />
                <asp:Parameter Name="Active" Type="Boolean" />
            </InsertParameters>
            <UpdateParameters>
                <asp:Parameter Name="Name" Type="String" />
                <asp:Parameter Name="Active" Type="Boolean" />
                <asp:Parameter Name="original_ID" Type="Int32" />
            </UpdateParameters>
        </asp:SqlDataSource>


</asp:Content>