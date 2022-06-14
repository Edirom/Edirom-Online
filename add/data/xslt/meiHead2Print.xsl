<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd" xpath-default-namespace="http://www.music-encoding.org/ns/mei" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Dec 21, 2011</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> johannes</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    
<!--    <xsl:output indent="yes" method="xml" omit-xml-declaration="yes"/>-->
    
<!--    <xsl:include href="edirom_params.xsl"/>-->
    
<!--    <xsl:include href="ediromOnline_functions.xsl"/>    -->
    
    <!--<xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>-->
    <xsl:template match="mei:meiHead">
        <xsl:element name="div">
            <xsl:attribute name="class">meiHead</xsl:attribute>
            <xsl:if test="string-length(mei:fileDesc/mei:titleStmt/mei:title/text()) gt 0">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('fileInfo')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./mei:fileDesc" mode="getFileInfo"/>
                    <xsl:if test="./mei:encodingDesc">
                        <xsl:apply-templates select="./mei:encodingDesc"/>
                    </xsl:if>
                </xsl:element>
            </xsl:if>
            <xsl:choose>
                <xsl:when test="count(./mei:workDesc/mei:work) gt 1">
                    <xsl:element name="div">
                        <xsl:attribute name="class">section</xsl:attribute>
                        <xsl:element name="h1">
                            <xsl:value-of select="eof:getLabel('works')"/>
                        </xsl:element>
                        <xsl:for-each select="./mei:workDesc/mei:work">
                            <xsl:call-template name="work">
                                <xsl:with-param name="labeled">
                                    <xsl:value-of select="true()"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </xsl:for-each>
                    </xsl:element>
                </xsl:when>
                <xsl:when test="./mei:workDesc/mei:work">
                    <xsl:apply-templates select="./mei:workDesc/mei:work">
                        <xsl:with-param name="labeled">
                            <xsl:value-of select="false()"/>
                        </xsl:with-param>
                    </xsl:apply-templates>
                </xsl:when>
            </xsl:choose>
            <xsl:choose>
                <xsl:when test="count(./mei:fileDesc/mei:sourceDesc/mei:source) gt 1">
                    <xsl:element name="div">
                        <xsl:attribute name="class">section</xsl:attribute>
                        <xsl:element name="h1">
                            <xsl:value-of select="eof:getLabel('sources')"/>
                        </xsl:element>
                        <xsl:for-each select="./mei:fileDesc/mei:sourceDesc/mei:source">
                            <xsl:call-template name="source">
                                <xsl:with-param name="labeled">
                                    <xsl:value-of select="true()"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </xsl:for-each>
                    </xsl:element>
                </xsl:when>
                <xsl:when test="./mei:fileDesc/mei:sourceDesc/mei:source">
                    <xsl:apply-templates select="./mei:fileDesc/mei:sourceDesc/mei:source">
                        <xsl:with-param name="labeled">
                            <xsl:value-of select="false()"/>
                        </xsl:with-param>
                    </xsl:apply-templates>
                </xsl:when>
            </xsl:choose>
            <xsl:if test="./mei:revisionDesc/mei:change">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('revisionDesc')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:for-each select="./mei:revisionDesc/mei:change">
                            <xsl:apply-templates select="."/>
                        </xsl:for-each>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="mei:work" name="work">
        <xsl:param name="labeled"/>
        <!-- TODO -->
        <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
                <xsl:choose>
                    <xsl:when test="$labeled eq 'true'">
                        <xsl:value-of select="./titleStmt/title[1]/text()"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('workDesc')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('workTitle')"/>
                </xsl:element>
                <xsl:apply-templates select="./titleStmt"/>
            </xsl:element>
            <xsl:if test="count(./pubStmt/child::*) gt 0">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('publication')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./pubStmt"/>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./langUsage | ./editionStmt or (./notesStmt and $includeNotes eq true)">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('additionalMeta')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./langUsage | ./editionStmt"/>
                        <xsl:if test="$includeNotes eq true">
                            <xsl:apply-templates select="./notesStmt"/>
                        </xsl:if>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./history and ./history/child::*/node()">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:choose>
                            <xsl:when test="./history/head/node()">
                                <xsl:apply-templates select="./history/head"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="eof:getLabel('history')"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./history/creation | ./history/p |./history/eventList"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            
            <!-- identifier -->
            <xsl:if test="./key or ./meter or ./perfMedium or ./castList">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('musicalInfo')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./key | ./meter | ./perfMedium | ./castList"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            <xsl:if test="count(./seriesStmt/child::node()) gt 0">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('series')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./seriesStmt"/>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./classification">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('classification')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./classification"/>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="mei:change">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('change')"/>
                <xsl:if test="./mei:date">
                    <xsl:element name="br"/>
                    <xsl:apply-templates select="./mei:date[1]" mode="valueOnly"/>
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="./mei:changeDesc/mei:p" mode="valueOnly"/>
                <!-- TODO: include respStmt -->
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="mei:fileDesc" mode="getFileInfo">
        <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
                <xsl:value-of select="eof:getLabel('titleStmt')"/>
            </xsl:element>
            <xsl:apply-templates select="./titleStmt"/>
        </xsl:element>
        <xsl:if test="count(./pubStmt/child::node()) gt 0">
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('publication')"/>
                </xsl:element>
                <xsl:apply-templates select="./pubStmt"/>
            </xsl:element>
        </xsl:if>
        <xsl:if test="count(./seriesStmt/child::node()) gt 0">
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('series')"/>
                </xsl:element>
                <xsl:apply-templates select="./seriesStmt"/>
            </xsl:element>
        </xsl:if>
    </xsl:template>
    <xsl:template match="titleStmt">
        <xsl:element name="div">
            <xsl:attribute name="class">propertyList</xsl:attribute>
            <xsl:for-each select="./title">
                <xsl:call-template name="title"/>
            </xsl:for-each>
            <xsl:for-each select="./respStmt/*">
                <xsl:call-template name="resp"/>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
    <xsl:template match="pubStmt">
        <xsl:element name="div">
            <xsl:attribute name="class">propertyList</xsl:attribute>
            <xsl:for-each select="./respStmt/*[not(local-name() eq 'resp')]">
                <xsl:call-template name="resp"/>
            </xsl:for-each>
            <xsl:for-each select="./address">
                <xsl:call-template name="address"/>
            </xsl:for-each>
            <xsl:for-each select="./date">
                <xsl:call-template name="date">
                    <xsl:with-param name="label">
                        <xsl:value-of select="eof:getLabel('publicationDate')"/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>
            <xsl:for-each select="./availability">
                <xsl:for-each select="./*">
                    <xsl:element name="div">
                        <xsl:attribute name="class">property</xsl:attribute>
                        <xsl:element name="div">
                            <xsl:attribute name="class">key</xsl:attribute>
                            <xsl:value-of select="concat(upper-case(substring(local-name(),1,1)), substring(local-name(),2))"/>
                        </xsl:element>
                        <xsl:element name="div">
                            <xsl:attribute name="class">value</xsl:attribute>
                            <xsl:choose>
                                <xsl:when test="not(./text() eq '')">
                                    <xsl:value-of select="./text()"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="string(' ')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:element>
                    </xsl:element>
                </xsl:for-each>
            </xsl:for-each>
            <xsl:for-each select="./identifier">
                <xsl:call-template name="identifier"/>
            </xsl:for-each>
            <xsl:for-each select="./geogName">
                <xsl:call-template name="geogName"/>
            </xsl:for-each>
            <xsl:if test="./unpub">
                <xsl:element name="div">
                    <xsl:attribute name="class">property</xsl:attribute>
                    <xsl:element name="div">
                        <xsl:attribute name="class">key</xsl:attribute>
                        <xsl:value-of select="string(' ')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">value</xsl:attribute>
                        <xsl:value-of select="eof:getLabel('unpub')"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="seriesStmt">
        <xsl:element name="div">
            <xsl:attribute name="class">propertyList</xsl:attribute>
            <xsl:for-each select="./title">
                <xsl:call-template name="title"/>
            </xsl:for-each>
            <xsl:for-each select="./respStmt/*[not(local-name() eq 'resp')]">
                <xsl:call-template name="resp"/>
            </xsl:for-each>
            <xsl:for-each select="./identifier">
                <xsl:call-template name="identifier"/>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
    <xsl:template match="source" name="source">
        <xsl:param name="labeled"/>
        <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
                <xsl:choose>
                    <xsl:when test="$labeled eq 'true'">
                        <xsl:value-of select="./titleStmt/title[1]/text()"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('sourceDesc')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('sourceTitle')"/>
                </xsl:element>
                <xsl:apply-templates select="./titleStmt"/>
            </xsl:element>
            <xsl:if test="count(./pubStmt/child::*) gt 0">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('publication')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./pubStmt"/>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./langUsage | ./editionStmt or (./notesStmt and $includeNotes eq true)">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('additionalMeta')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./langUsage | ./editionStmt"/>
                        <xsl:if test="$includeNotes eq true">
                            <xsl:apply-templates select="./notesStmt"/>
                        </xsl:if>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./history and ./history/child::*/node()">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:choose>
                            <xsl:when test="./history/head/node()">
                                <xsl:apply-templates select="./history/head"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="eof:getLabel('history')"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./history/creation | ./history/p |./history/eventList"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./physDesc">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('physDesc')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./physDesc/*"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            
            <!-- identifier -->
            <xsl:if test="./key or ./meter or ./perfMedium or ./castList">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('musicalInfo')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">propertyList</xsl:attribute>
                        <xsl:apply-templates select="./key | ./meter | ./perfMedium | ./castList"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
            <xsl:if test="count(./seriesStmt/child::node()) gt 0">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('series')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./seriesStmt"/>
                </xsl:element>
            </xsl:if>
            <xsl:if test="./classification/termList/term/node()">
                <xsl:element name="div">
                    <xsl:attribute name="class">section</xsl:attribute>
                    <xsl:element name="h1">
                        <xsl:value-of select="eof:getLabel('classification')"/>
                    </xsl:element>
                    <xsl:apply-templates select="./classification"/>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="title" name="title">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('title')"/>
                <xsl:if test="@type">
                        (<xsl:value-of select="eof:getLabel(@type)"/>)
                    </xsl:if>
                <xsl:if test="@xml:lang">
                    <xsl:element name="span">
                        <xsl:attribute name="class">lang</xsl:attribute>
                        (<xsl:value-of select="@xml:lang"/>)
                    </xsl:element>
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="respStmt/*[not(local-name() eq 'resp')]" name="resp">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@role">
                        <xsl:value-of select="if(eof:getLabel(@role) != @role)then(eof:getLabel(@role))else(concat(upper-case(substring(@role,1,1)), substring(@role,2)))"/>
                    </xsl:when>
                    <xsl:when test="exists(./ancestor::*[local-name() eq 'pubStmt']) and count(preceding-sibling::*) eq 0 and count(following-sibling::*) eq 0">
                        <xsl:value-of select="eof:getLabel('publisher')"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('responsible')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@authURI">
                        <xsl:element name="a">
                            <xsl:attribute name="class">authURI</xsl:attribute>
                            <xsl:attribute name="href">
                                <xsl:value-of select="@authURI"/>
                            </xsl:attribute>
                            <xsl:value-of select="./text()"/>
                        </xsl:element>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="./text()"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="respStmt/*[not(local-name() eq 'resp')]" name="respValue" mode="valueOnly">
        <xsl:choose>
            <xsl:when test="@authURI">
                <xsl:element name="a">
                    <xsl:attribute name="class">authURI</xsl:attribute>
                    <xsl:attribute name="href">
                        <xsl:value-of select="@authURI"/>
                    </xsl:attribute>
                    <xsl:value-of select="./text()"/>
                </xsl:element>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="./text()"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:variable name="role">
            <xsl:choose>
                <xsl:when test="./@role eq 'composer'">
                    <xsl:value-of select="eof:getLabel('composer')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'lyricist'">
                    <xsl:value-of select="eof:getLabel('lyricist')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'librettist'">
                    <xsl:value-of select="eof:getLabel('librettist')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'publisher'">
                    <xsl:value-of select="eof:getLabel('publisher')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'funder'">
                    <xsl:value-of select="eof:getLabel('funder')"/>
                </xsl:when>
                <!-- TODO: Add other values -->
                <xsl:when test="./@role">
                    <xsl:value-of select="concat(upper-case(substring(@role,1,1)), substring(@role,2))"/>
                </xsl:when>
                <xsl:when test="exists(./ancestor::*[local-name() eq 'pubStmt']) and count(preceding-sibling::*) eq 0 and count(following-sibling::*) eq 0">
                    <xsl:value-of select="eof:getLabel('publisher')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="string('')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:if test="not($role eq '')">
            <xsl:element name="br"/>
            <xsl:value-of select="concat('[',$role,']')"/>
        </xsl:if>
    </xsl:template>
    <xsl:template match="key">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('key')"/>
            </xsl:element>
            
            <!-- TODO: make key language specific… -->
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:variable name="pname">
                    <xsl:choose>
                        <xsl:when test="matches(@pname, '[cdfg]') and @accid.ges eq 'ff'">
                            <xsl:value-of select="concat(upper-case(@pname), 'eses')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'e' and @accid.ges eq 'ff'">
                            <xsl:value-of select="string('Eses')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'a' and @accid.ges eq 'ff'">
                            <xsl:value-of select="string('Asas')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'b' and @accid.ges eq 'ff'">
                            <xsl:value-of select="string('Heses')"/>
                        </xsl:when>
                        <xsl:when test="matches(@pname, '[cdfg]') and @accid.ges eq 'f'">
                            <xsl:value-of select="concat(upper-case(@pname), 'es')"/>
                        </xsl:when>
                        <xsl:when test="matches(@pname,'[ae]') and @accid.ges eq 'f'">
                            <xsl:value-of select="concat(upper-case(@pname), 's')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'b' and @accid.ges eq 'ff'">
                            <xsl:value-of select="string('B')"/>
                        </xsl:when>
                        <xsl:when test="matches(@pname, '[cdefga]') and (not(@accid.ges) or @accid.ges eq 'n')">
                            <xsl:value-of select="upper-case(@pname)"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'b' and (not(@accid.ges) or @accid.ges eq 'n')">
                            <xsl:value-of select="string('H')"/>
                        </xsl:when>
                        <xsl:when test="matches(@pname, '[cdefga]') and @accid.ges eq 's'">
                            <xsl:value-of select="concat(upper-case(@pname), 'is')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'b' and @accid.ges eq 's'">
                            <xsl:value-of select="string('His')"/>
                        </xsl:when>
                        <xsl:when test="matches(@pname, '[cdefga]') and @accid.ges eq 'ss'">
                            <xsl:value-of select="concat(upper-case(@pname), 'isis')"/>
                        </xsl:when>
                        <xsl:when test="@pname eq 'b' and @accid.ges eq 'ss'">
                            <xsl:value-of select="string('Hisis')"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="mode">
                    <xsl:choose>
                        <xsl:when test="@mode eq 'major'">
                            <xsl:text>Dur</xsl:text>
                        </xsl:when>
                        <xsl:when test="@mode eq 'minor'">
                            <xsl:text>Moll</xsl:text>
                        </xsl:when>
                        <!-- TODO: Sonstige Tonarten -->
                    </xsl:choose>
                </xsl:variable>
                <xsl:value-of select="concat($pname, '-', $mode)"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="meter">
        <!-- TODO -->
    </xsl:template>
    <xsl:template match="perfMedium">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('instrumentation')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:for-each select=".//performer">
                    <xsl:choose>
                        <xsl:when test="not(./instrVoice/@count) or number(./instrVoice/@count) eq 1">
                            <xsl:text>1 </xsl:text>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat(./instrVoice/@count, ' ')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="./instrVoice/@solo eq 'true'">
                        <xsl:text>Solo-</xsl:text>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="./instrVoice/text() eq '' and ./instrVoice/@label">
                            <xsl:value-of select="./instrVoice/@label"/>
                        </xsl:when>
                        <xsl:when test="not(./instrVoice/text() eq '')">
                            <xsl:value-of select="./instrVoice/text()"/>
                        </xsl:when>
                        <xsl:when test="./instrVoice/text() eq '' and ./instrVoice/@reg">
                            <xsl:value-of select="./instrVoice/@reg"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="number(./instrVoice/@count) gt 1">
                                    <xsl:value-of select="eof:getLabel('unspecPerfMulti')"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="eof:getLabel('unspecPerfSingle')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:element name="br"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="castList">
        <!-- TODO -->
    </xsl:template>
    <xsl:template match="identifier" name="identifier">
        <!-- TODO -->
    </xsl:template>
    <xsl:template match="editionStmt">
        <xsl:for-each select="./*">
            <xsl:choose>
                <xsl:when test="local-name() eq 'respStmt'">
                    <xsl:for-each select="./*[not(local-name() eq 'resp')]">
                        <xsl:call-template name="resp"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="local-name() eq 'edition'">
                    <xsl:apply-templates select="."/>
                </xsl:when>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="edition">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('edition')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="geogName" name="geogName">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('geogName')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:call-template name="geogNameValue"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="geogName" name="geogNameValue" mode="valueOnly">
        <xsl:apply-templates select="node()" mode="#current"/>
    </xsl:template>
    <xsl:template match="creation">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('creation')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="./child::node()[1]"/>
                <xsl:for-each select="./child::*[count(preceding-sibling::*) gt 0]">
                    <xsl:element name="br"/>
                    <xsl:apply-templates select="node()" mode="valueOnly"/>
                    <xsl:value-of select="string(' ')"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="eventList">
        <xsl:for-each select="./event">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="@label">
                            <xsl:value-of select="@label"/>
                        </xsl:when>
                        <xsl:when test="local-name(child::*[1]) eq 'title'">
                            <xsl:apply-templates select="./title[1]" mode="valueOnly"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="eof:getLabel('event')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="local-name(child::*[1]) eq 'title'">
                            <xsl:apply-templates select="node() except title[1]" mode="valueOnly"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:apply-templates select="node()" mode="valueOnly"/>
                            <xsl:value-of select="string(' ')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="geogName" mode="valueOnly">
        <xsl:apply-templates select="node()"/>
    </xsl:template>
    <xsl:template match="langUsage">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('language')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="language[1]/node()"/>
                <xsl:for-each select="./language[count(preceding-sibling::language) gt 0]">
                    <xsl:element name="br"/>
                    <xsl:apply-templates select="node()"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="notesStmt">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('notesStmt')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:for-each select="./annot">
                    <xsl:element name="p">
                        <xsl:if test="@label">
                            <xsl:element name="h2">
                                <xsl:attribute name="class">annotHead</xsl:attribute>
                                <xsl:value-of select="@label"/>
                            </xsl:element>
                        </xsl:if>
                        <xsl:apply-templates select="node()"/>
                        <!-- resolve plist, resp, source, type -->
                    </xsl:element>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="classification">
        <xsl:for-each select="./termList/term">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:value-of select="eof:getLabel('classification')"/>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <!-- TODO: have a closer look into the contents? -->
                    <xsl:value-of select="."/>
                    <xsl:if test="@classcode and id(substring(@classcode, 2))">
                        <xsl:text>(</xsl:text>
                        <xsl:choose>
                            <xsl:when test="id(substring(@classcode,2))/@authURI and id(substring(@classcode,2))/@authority">
                                <xsl:element name="a">
                                    <xsl:attribute name="class">authURI</xsl:attribute>
                                    <xsl:attribute name="href">
                                        <xsl:value-of select="id(substring(./@classcode, 2))/@authURI"/>
                                    </xsl:attribute>
                                    <xsl:value-of select="id(substring(./@classcode, 2))/@authority"/>
                                </xsl:element>
                            </xsl:when>
                            <xsl:when test="id(substring(@classcode,2))/@authority">
                                <xsl:value-of select="id(substring(@classcode,2))/@authority"/>
                            </xsl:when>
                            <xsl:when test="id(substring(@classcode,2))/@label">
                                <xsl:value-of select="id(substring(@classcode,2))/@label"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="id(substring(@classcode,2))/text()"/>
                            </xsl:otherwise>
                        </xsl:choose>
                        <xsl:text>)</xsl:text>
                    </xsl:if>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="address" name="address">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('address')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:call-template name="addressValue"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="address" name="addressValue" mode="valueOnly">
        <xsl:for-each select="./addrLine">
            <xsl:value-of select="./text()"/>
            <xsl:if test="./following-sibling::addrLine">
                <xsl:element name="br"/>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="date" name="date">
        <xsl:param name="label"/>
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="$label"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:call-template name="dateValue"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="date" name="dateValue" mode="valueOnly">
        <xsl:choose>
            <xsl:when test="@reg">
                <!-- TODO: prettify date -->
                <xsl:value-of select="@reg"/>
            </xsl:when>
            <xsl:when test="@startdate and @enddate">
                <xsl:value-of select="eof:getLabel('dateFrom')"/>
                <xsl:value-of select="@startdate"/>
                <xsl:value-of select="eof:getLabel('dateUntil')"/>
                <xsl:value-of select="@enddate"/>
            </xsl:when>
            <xsl:when test="@notbefore and @notafter">
                <xsl:value-of select="eof:getLabel('dateNotbefore')"/>
                <xsl:value-of select="@notbefore"/>, <xsl:value-of select="eof:getLabel('dateNotafter')"/>
                <xsl:value-of select="@notafter"/>
            </xsl:when>
            <xsl:when test="@startdate and @notafter">
                <xsl:value-of select="eof:getLabel('dateFrom')"/>
                <xsl:value-of select="@startdate"/>, <xsl:value-of select="eof:getLabel('dateNotafter')"/>
                <xsl:value-of select="@notafter"/>
            </xsl:when>
            <xsl:when test="@notbefore and @enddate">
                <xsl:value-of select="eof:getLabel('dateNotbefore')"/>
                <xsl:value-of select="@notbefore"/>, <xsl:value-of select="eof:getLabel('dateUntil')"/>
                <xsl:value-of select="@enddate"/>
            </xsl:when>
            <xsl:when test="@startdate">
                <xsl:value-of select="eof:getLabel('dateFrom')"/>
                <xsl:value-of select="@startdate"/>
            </xsl:when>
            <xsl:when test="@enddate">
                <xsl:value-of select="eof:getLabel('dateUntil')"/>
                <xsl:value-of select="@enddate"/>
            </xsl:when>
            <xsl:when test="@notbefore">
                <xsl:value-of select="eof:getLabel('dateNotbefore')"/>
                <xsl:value-of select="@notbefore"/>
            </xsl:when>
            <xsl:when test="@notafter">
                <xsl:value-of select="eof:getLabel('dateNotafter')"/>
                <xsl:value-of select="@notafter"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test="local-name() eq 'date'">
                    <xsl:value-of select="./text()"/>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="condition">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('condition')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="dimensions">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('dimensions')"/>
                <xsl:if test="@unit and string-length(@unit) gt 0">
                    <xsl:element name="br"/>
                    (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="exhibHist">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('exhibHist')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="extent">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('extent')"/>
                <xsl:if test="@unit and not(@unit eq '')">
                    <xsl:element name="br"/>
                    (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="handList">
        <xsl:for-each select="./hand">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:value-of select="eof:getLabel('hand')"/>
                    <xsl:if test="matches(local-name(id(substring-after(@resp, '#'))), '(persName)|(name)|(corpName)')">
                        : <xsl:value-of select="id(substring-after(@resp, '#'))"/>
                        <!-- TODO: Why does this select already the text within the element, but not the element itself??? -->
                    </xsl:if>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:apply-templates select="node()" mode="valueOnly"/>
                    <xsl:value-of select="string(' ')"/>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="inscription">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('inscription')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="physLoc">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('physLoc')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="physMedium">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('physMedium')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="plateNum">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('plateNum')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="provenance">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('provenance')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="./parent::physDesc">
                        <xsl:apply-templates select="node()" mode="valueOnly"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:apply-templates select="node()"/>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="repository">
        <!-- TODO: Resolve @authURI etc. -->
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('repository')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="titlePage">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('titlePage')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="treatHist">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('treatHist')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="treatSched">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('treatSched')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="watermark">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:choose>
                    <xsl:when test="@label">
                        <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="eof:getLabel('watermark')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="encodingDesc">
        <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
                <xsl:value-of select="eof:getLabel('encodingDesc')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">propertyList</xsl:attribute>
                <xsl:for-each select="./child::*">
                    <xsl:apply-templates select="."/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="appInfo">
        <xsl:for-each select="./application">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:value-of select="eof:getLabel('application')"/>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:value-of select="./name/text()"/>
                    <xsl:if test="@version and string-length(@version) gt 0">
                        <xsl:value-of select="concat(' (',eof:getLabel('version'), ' ', @version,')')"/>
                    </xsl:if>
                    <xsl:if test="./p | ./ptr">
                        <xsl:element name="br"/>
                        <xsl:apply-templates select="./p | ./ptr" mode="valueOnly"/>
                    </xsl:if>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="samplingDecl">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('samplingDecl')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="./p" mode="valueOnly"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="projectDesc">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('projectDesc')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="./p" mode="valueOnly"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="editorialDecl">
        <xsl:for-each select="./child::*">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="local-name() eq 'p'">
                            <xsl:value-of select="eof:getLabel('editorialDecl')"/>
                        </xsl:when>
                        <xsl:when test="local-name() eq 'correction'">
                            <xsl:value-of select="eof:getLabel('correctionPrinciples')"/>
                        </xsl:when>
                        <xsl:when test="local-name() eq 'interpretation'">
                            <xsl:value-of select="eof:getLabel('interpretationPrinciples')"/>
                        </xsl:when>
                        <xsl:when test="local-name() eq 'normalization'">
                            <xsl:value-of select="eof:getLabel('normalizationPrinciples')"/>
                        </xsl:when>
                        <xsl:when test="local-name() eq 'segmentation'">
                            <xsl:value-of select="eof:getLabel('segmentationPrinciples')"/>
                        </xsl:when>
                        <xsl:when test="local-name() eq 'stdVals'">
                            <xsl:value-of select="eof:getLabel('stdValsPrinciples')"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="local-name() eq 'p'">
                            <xsl:apply-templates select="." mode="valueOnly"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:apply-templates select="./p" mode="valueOnly"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="p">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="p" mode="valueOnly">
        <xsl:element name="p">
            <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="lb" mode="valueOnly">
        <xsl:element name="br"/>
    </xsl:template>
    <xsl:template match="event" mode="valueOnly">
        <xsl:element name="p">
            <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="ref" mode="#all">
        <xsl:element name="a">
            <xsl:attribute name="href">
                <xsl:value-of select="@target"/>
            </xsl:attribute>
            <xsl:apply-templates select="* | text()"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="rend" mode="#all">
        <xsl:variable name="style">
            <xsl:if test="@color">
                color: 
                <xsl:choose>
                    <xsl:when test="starts-with(@color, 'x')">
                        #<xsl:value-of select="substring(@color, 2)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="@color"/>
                    </xsl:otherwise>
                </xsl:choose>;
                
            </xsl:if>
            <xsl:if test="@fontfam | @fontname">
                font-family: '<xsl:value-of select="@fontfam | @fontname"/>';
            </xsl:if>
            <xsl:if test="@fontweight">
                font-weight: '<xsl:value-of select="@fontweight"/>';
            </xsl:if>
        </xsl:variable>
        <xsl:element name="span">
            <xsl:if test="@rend and string-length(@rend) gt 0">
                <xsl:attribute name="class">
                    <xsl:value-of select="@rend"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="string-length($style) gt 0">
                <xsl:attribute name="style">
                    <xsl:value-of select="normalize-space($style)"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates select="* | @* | text()"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="ptr" mode="#all">
        <xsl:text>[</xsl:text>
        <xsl:element name="a">
            <xsl:attribute name="href">
                <xsl:value-of select="@target"/>
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="@label and string-length(@label) gt 0">
                    <xsl:value-of select="@label"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>Link</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
        <xsl:text>]</xsl:text>
    </xsl:template>
    <xsl:template match="* | @*" mode="#all">
        <xsl:apply-templates mode="#current"/>
    </xsl:template>
    
    <!--<xsl:template match="music" mode="#all"/>-->
    
    <!--<xsl:template match="text()" mode="#all">
        <xsl:copy/>
    </xsl:template>-->
</xsl:stylesheet>