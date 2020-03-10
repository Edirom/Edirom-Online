<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:mei="http://www.music-encoding.org/ns/mei" exclude-result-prefixes="xs" version="2.0" xml:space="default">

    <xsl:template name="makeSection">
        <xsl:param name="element"/>
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('section')"/>
            <xsl:element name="h1">
                <xsl:value-of select="eof:getLabel(local-name())"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('propertyList')"/>
                <xsl:for-each select="@*">
                    <xsl:call-template name="makeProperty">
                        <xsl:with-param name="key" select="local-name(.)"/>
                    </xsl:call-template>
                </xsl:for-each>
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <xsl:template name="rendToSection">
        <xsl:param name="key">
            <xsl:value-of select="eof:getLabel(local-name())"/>
        </xsl:param>
        <xsl:attribute name="class">section</xsl:attribute>
        <xsl:element name="h1">
            <xsl:attribute name="class" select="string('key')"/>
            <xsl:value-of select="$key"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template name="propOrSub">
        <xsl:param name="sub"/>
        <xsl:param name="key"/>
        <xsl:param name="node"/>
        <xsl:choose>
            <xsl:when test="$sub">
                <xsl:call-template name="makeSubProperty">
                    <xsl:with-param name="node" select="."/>
                    <xsl:with-param name="key" select="$key"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="makeProperty">
                    <xsl:with-param name="node" select="."/>
                    <xsl:with-param name="key" select="$key"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="rendToProperty">
        <xsl:param name="key" select="local-name()"/>
        <xsl:attribute name="class">property</xsl:attribute>
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('key')"/>
            <xsl:value-of select="eof:getLabel($key)"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template name="makeProperty">
        <xsl:param name="node"/>
        <xsl:param name="key" select="local-name($node)"/>
        <xsl:param name="sub"/>
        <xsl:element name="div">
            <xsl:attribute name="class" select="if($sub)then(string('subProperty'))else(string('property'))"/>
            <xsl:element name="div">
                <xsl:attribute name="class" select="if($sub)then('subKey')else(string('key'))"/>
                <xsl:value-of select="eof:getLabel($key)"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('value')"/>
                <xsl:apply-templates select="." mode="plainCommaSep">
                    <xsl:with-param name="sub" select="true()"/>
                
                </xsl:apply-templates>
                <!--<xsl:value-of select=".//* | .//@*"></xsl:value-of>-->
                <!-- TODO:apply-templates und weitere templates für header// -->
            </xsl:element>
        </xsl:element>
    </xsl:template>

<xsl:template name="rendToSubProperty">
        <xsl:param name="key" select="local-name()"/>
        <xsl:attribute name="class">subProperty</xsl:attribute>
        <xsl:element name="span">
            <xsl:attribute name="class" select="string('subkey')"/>
            <xsl:value-of select="eof:getLabel($key)"/>
        </xsl:element>
    </xsl:template>
    <xsl:template name="makeSubProperty">
        <xsl:param name="node"/>
        <xsl:param name="key" select="local-name($node)"/>
        <xsl:element name="div">
            <xsl:attribute name="class">subProperty</xsl:attribute>
            <xsl:element name="span">
                <xsl:attribute name="class" select="string('subkey')"/>
                <xsl:value-of select="eof:getLabel($key)"/>
            </xsl:element>
            <xsl:element name="span">
                <xsl:attribute name="class" select="string('subvalue')"/>
                <xsl:apply-templates select="." mode="subProp"/>
                <!--<xsl:value-of select=".//* | .//@*"></xsl:value-of>-->
                <!-- TODO:apply-templates und weitere templates für header// -->
            </xsl:element>
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>