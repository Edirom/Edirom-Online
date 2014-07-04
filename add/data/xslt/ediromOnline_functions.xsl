<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:mei="http://www.music-encoding.org/ns/mei" exclude-result-prefixes="xs" version="2.0" xml:space="default">

<!-- FUNCTIONs ======================================================= -->

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

</xsl:stylesheet>

