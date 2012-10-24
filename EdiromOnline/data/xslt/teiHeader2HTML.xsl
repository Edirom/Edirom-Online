<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" exclude-result-prefixes="xs" version="2.0" xml:space="default">


<!-- IMPORTs ======================================================= -->
    <xsl:import href="ediromOnline_params.xsl"/>
    <xsl:import href="ediromOnline_functions.xsl"/>
    <xsl:import href="ediromOnline_metadata.xsl"/>
    
<!-- IMPORTs TEI ======================================================= -->
    <xsl:import href="tei/common2/tei-param.xsl"/>
    <xsl:import href="tei/common2/tei.xsl"/>
    <xsl:import href="tei/xhtml2/tei-param.xsl"/>
    <xsl:import href="tei/common2/core.xsl"/>
    <xsl:import href="tei/common2/textstructure.xsl"/>
    <xsl:import href="tei/common2/header.xsl"/>
    <xsl:import href="tei/common2/linking.xsl"/>
    <xsl:import href="tei/common2/figures.xsl"/>
    <xsl:import href="tei/common2/textcrit.xsl"/>
    <xsl:import href="tei/common2/i18n.xsl"/>
    <xsl:import href="tei/common2/functions.xsl"/>
    <xsl:import href="tei/xhtml2/core.xsl"/>
    <xsl:import href="tei/xhtml2/corpus.xsl"/>
    <xsl:import href="tei/xhtml2/dictionaries.xsl"/>
    <xsl:import href="tei/xhtml2/drama.xsl"/>
    <xsl:import href="tei/xhtml2/figures.xsl"/>
    <xsl:import href="tei/xhtml2/header.xsl"/>
    <xsl:import href="tei/xhtml2/linking.xsl"/>
    <xsl:import href="tei/xhtml2/namesdates.xsl"/>
    <xsl:import href="tei/xhtml2/tagdocs.xsl"/>
    <xsl:import href="tei/xhtml2/textstructure.xsl"/>
    <xsl:import href="tei/xhtml2/textcrit.xsl"/>
    <xsl:import href="tei/xhtml2/transcr.xsl"/>
    <xsl:import href="tei/xhtml2/verse.xsl"/>
    <xsl:import href="tei/common2/verbatim.xsl"/>
    
<!-- OUTPUT ======================================================= -->
    <xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes"/>

<!-- DEFAULT TEMPLATEs ======================================================= -->
    <xsl:template match="/">
        <xsl:apply-templates select="//tei:teiHeader"/>
    </xsl:template>
    <xsl:template match="*">
        <xsl:choose>
            <xsl:when test="*">
                <xsl:call-template name="makeSection"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="makeProperty"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
   
<!-- NAMED TEMPLATEs ======================================================= -->
    <xsl:template name="bodyMicroData"/>

<!-- TEMPLATEs ======================================================= -->
    <xsl:template match="tei:teiHeader">
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('teiHeader')"/>
            <xsl:element name="h1">
                <xsl:value-of select="eof:getLabel('metadata')"/>
            </xsl:element>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:change">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('change')"/>
                <xsl:if test="@n">
                    <xsl:value-of select="concat(' ', @n)"/>
                </xsl:if>
                <xsl:if test="@when">
                    <xsl:element name="br"/>
                    <xsl:value-of select="./@when"/>
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:value-of select="concat(@who, ': ')"/>
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <!--<xsl:template match="tei:editor">
        <xsl:element name="span">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
            <xsl:text> (</xsl:text><xsl:value-of select="eof:getLabel('editor')"/><xsl:text>.)</xsl:text>
        </xsl:element>
    </xsl:template>-->
    <xsl:template match="tei:respStmt">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:resp">
        <xsl:element name="span">
            <xsl:call-template name="rendToClass"/>
            <xsl:value-of select="if(eof:getLabel(tei:resp/text()) != '')                                   then(eof:getLabel(tei:resp/text()))                                   else(text())"/>
            <xsl:value-of select="$pListKeyDelim"/>
        </xsl:element>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element witness</desc>
    </doc>
    <xsl:template match="tei:witness">
        <xsl:element name="div">
            <xsl:call-template name="rendToProperty">
                <xsl:with-param name="key" select="@xml:id"/>
            </xsl:call-template>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('value')"/>
                <xsl:for-each select="tei:biblStruct | tei:msDesc | tei:note">
                    <xsl:if test="preceding-sibling::*">
                        <br/>
                    </xsl:if>
                    <xsl:apply-templates mode="plainCommaSep"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:note" mode="plainCommaSep">
        See: <xsl:apply-templates/>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element msDesc</desc>
    </doc>
    <xsl:template match="tei:msDesc">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="tei:msIdentifier" mode="plainCommaSep">
        <xsl:value-of select="tei:repository, tei:settlement, tei:country" separator=", "/>
        <xsl:text>: </xsl:text>
        <xsl:value-of select="tei:idno"/>
    </xsl:template>
    <xsl:template match="tei:title">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
            <xsl:with-param name="key" select="if(@level)then(concat(local-name(), '_', @level))else(local-name())"/>
        </xsl:call-template>
    </xsl:template>
    <xsl:template match="tei:revisionDesc">
        <xsl:call-template name="makeSection"/>
    </xsl:template>
    <xsl:template match="tei:funder">
        <xsl:element name="div">
            <xsl:call-template name="rendToProperty"/>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('value')"/>
                <xsl:apply-templates mode="plainDivs"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:address" mode="plainDivs">
        <xsl:apply-templates select="tei:street" mode="#current"/>
        <xsl:call-template name="postCodeSettlement"/>
    </xsl:template>
    <xsl:template match="*" mode="plainCommaSep">
        <xsl:choose>
            <xsl:when test="*/*">
                <xsl:apply-templates mode="plainCommaSep"/>
            </xsl:when>
            <xsl:when test="*">
                <xsl:value-of select="./*" separator=", "/>
            </xsl:when>
            <xsl:otherwise/>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="*" mode="plainDivs">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:placeName">
        <xsl:value-of select="*" separator=", "/>
    </xsl:template>
    <xsl:template match="tei:street" mode="plainDivs">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template name="postCodeSettlement">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="id">postCodeSettlement</xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates select="tei:postCode" mode="plain"/>
            <xsl:text> </xsl:text>
            <xsl:apply-templates select="tei:placeName"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:editionStmt | tei:publicationStmt | tei:seriesStmt">
        <xsl:element name="div">
            <xsl:call-template name="rendToSection"/>
            <xsl:for-each select="*">
                <xsl:element name="div">
                    <xsl:call-template name="rendToProperty"/>
                    <xsl:element name="div">
                        <xsl:attribute name="class" select="string('value')"/>
                        <xsl:apply-templates mode="plainDivs"/>
                    </xsl:element>
                </xsl:element>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>