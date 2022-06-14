<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions"
    xmlns:functx="http://www.functx.com"
    exclude-result-prefixes="xs xd"
    version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Mar 14, 2012</xd:p>
            <xd:p><xd:b>Author:</xd:b> bwb</xd:p>
            <xd:p>XSL-Module to include all global XSL:FUNCTIONs derived of the Edirom Online Project.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:import href="ediromOnline_params.xsl"/>
    <xsl:include href="functx-1.0-nodoc-2007-01.xsl"/>
    
    <!-- TODO: an die Einstellungen anpassen -->
    <xsl:variable name="languageFile" select="document('../locale/edirom-lang-en.xml')"/>
    
    <xsl:function name="eof:getLanguageString" as="xs:string">
        <xsl:param name="key" as="xs:string"/>
        <xsl:param name="values" as="xs:string*"/>
        <!--<xsl:param name="lang" as="xs:string"/> TODO: übergebenen Parameter mit Sprache aus Einstellungen vergleichen und ggf. andere Sprachdatei laden-->
        
        <xsl:value-of select="functx:replace-multi($languageFile//entry[@key = $key]/@value, for $i in (0 to (count($values) - 1)) return concat('\{',$i,'\}'), $values)"/>
        
    </xsl:function>
    
    <xsl:function name="eof:getLabel" xpath-default-namespace="">
        <xsl:param name="key"/>
        <xsl:choose>
            <xsl:when test="$language/id($key) and not($language/id($key)/text() eq '')">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$key"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:function name="eof:getFacsImgParas">
        <xsl:param name="resolution"/>
        <xsl:param name="areaWidth"/>
        <xsl:value-of select="concat('&amp;dw=',floor($resolution*$areaWidth), '&amp;mo=file')"/>
    </xsl:function>
    
</xsl:stylesheet>